import { Request, Response } from "express";
import prisma from "../libs/prismaClient";
import { Food } from "../types/Food";
import { replaceCommaWithDot } from "../utilities/formatter";
import JWT, { JwtPayload } from "jsonwebtoken";
import { Meal } from "@prisma/client";
import { MealWithFoodsArrayNumber } from "../types/Meal";

interface DecodedToken extends JwtPayload {
  id: number;
  email: string;
  // Adicione outras propriedades que você espera do token
}

//CRUD BY USER ID

export const getMealsByUserId = async (req: Request, res: Response) => {
  // Recupere o token do cabeçalho de autorização
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const token = authorizationHeader.split(" ")[1]; // Obtém o token sem o "Bearer" //gera um array onde foi feito o split

  // Decodifique o token para obter os dados do usuário
  try {
    const decodedToken = JWT.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedToken;
    // Agora você pode acessar os dados do usuário do token, como decodedToken.id e decodedToken.email

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      include: {
        users_has_meals: {
          include: {
            meals: {
              include: {
                meals_has_foods: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    //map criando array de meals do usuario
    const userMeals = user.users_has_meals.map((item) => item.meals);

    res.status(200).json(userMeals);
    return;
  } catch (error) {
    console.error("Error fetching user's foods:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getOneMealByUserId = async (req: Request, res: Response) => {

  const mealId = parseInt(req.params.id);

  // getting auth Token
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  //getting token
  const token = authorizationHeader.split(" ")[1];


  try {
    const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;
    //getting user info JWT

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      include: {
        users_has_meals: {
          where: { meals_id: mealId }
        }
      }
    });

    if (!user || user.users_has_meals.length === 0) {
      res.status(404).json({ error: "Meal not found or doesn't belong to the user." });
      return;
    }

    // details about the food to be updated
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        meals_has_foods: {
          include: {
            foods: true
          }
        }
      }
    });

    if (!meal) {
      res.status(404).json({ error: "Meal not found." });
      return;
    }

    res.status(200).json(meal);
    return;

  } catch (error) {
    console.error("Error fetching user's foods:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

export const createMealByUserId = async (req: Request, res: Response) => {
  let { name, portion, protein, calories, grease, salt, image = "/default.png", foods_id, } = req.body;


  if (Array.isArray(foods_id) && foods_id.every(item => typeof item === 'string')) {
    //transforming string array in number array
    foods_id = foods_id.map((id: string) => parseInt(id));
    console.log("Foods_Id: ", foods_id);
  }

  if (image === undefined || image === "") {
    image = "/default.png";
  }

  if (protein !== undefined && protein !== "" && typeof protein === "string") {
    console.log("PROTEIN: ", protein)
    console.log("TYPEOF PROTEIN", typeof (protein))
    protein = replaceCommaWithDot(protein);
  }

  if (
    calories !== undefined &&
    calories !== "" &&
    typeof protein === "string"
  ) {
    calories = replaceCommaWithDot(calories);
  }

  if (grease !== undefined && grease !== "" && typeof protein === "string") {
    grease = replaceCommaWithDot(grease);
  }

  if (salt !== undefined && salt !== "" && typeof protein === "string") {
    salt = replaceCommaWithDot(salt);
  }

  if (!foods_id || !Array.isArray(foods_id) || foods_id.length === 0) {
    console.log("FOODS ID:", foods_id)
    console.log("FOODS ID:", typeof (foods_id))

    //O FOODSID esta chegando como undefined!
    res.status(400).json({ error: "FoodIds cant be empty." });
    return;
  }

  // getting auth token
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  //taking away the word Bearer
  const token = authorizationHeader.split(" ")[1];

  try {
    //getting user info
    const decodedToken = JWT.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedToken;

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const newMeal = await prisma.meal.create({
      data: {
        name,
        isMeal: 1,
        portion: parseInt(portion),
        protein: parseFloat(protein),
        calories: parseFloat(calories),
        grease: parseFloat(grease),
        salt: parseFloat(salt),
        image,

        //na tabela meals_has_foods foi criado um food para a meal criada.
        meals_has_foods: {
          create: foods_id.map((foodId: number) => ({
            foods: {
              connect: {
                id: foodId,
              },
            },
          })),
        },

        users_has_meals: {
          create: {
            users: {
              connect: {
                id: decodedToken.id,
              },
            },
          },
        },
      },
      include: {
        meals_has_foods: {
          include: {
            foods: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ msg: "Food created with success:", meal: newMeal });

    if (res.status(400)) {

    }

    return;
  } catch (error) {
    console.error("Error fetching user's foods:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateMealByUserId = async (req: Request, res: Response) => {
  let { name, protein, calories, grease, salt, image = "/default.png", foods_id } = req.body;

  const mealId = parseInt(req.params.id);

  console.log("mealID: ", mealId);

  if (Array.isArray(foods_id) && foods_id.every(item => typeof item === 'string')) {
    //transforming string array in number array
    foods_id = foods_id.map((id: string) => parseInt(id));
    console.log("Foods_Id: ", foods_id);
  }

  if (!protein && !calories && !grease && !salt && foods_id.length === 0) {
    res.status(400).json({ msg: "Unable to update, please enter a field to be updated." });
    return;
  }

  // getting auth token
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  //taking away the word Bearer
  const token = authorizationHeader.split(" ")[1];

  try {
    //getting userInfo Token
    const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      include: {
        users_has_meals: true,
      },
    });

    if (!user || user.users_has_meals.length === 0) {
      res
        .status(404)
        .json({ error: "Meal not found or doesn't belong to the user." });
      return;
    }

    //getting Meal to update
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        meals_has_foods: true,
      },
    });

    if (!meal) {
      res.status(404).json({ error: "Meal not found." });
      return;
    }

    if (meal) {
      const requestedFoodIds: number[] = foods_id;

      // Get the food IDs currently associated with the meal
      const currentFoodIds: number[] = meal.meals_has_foods.map(
        (item) => item.foods_id
      );

      // Calculate the food IDs to be added and removed
      const foodIdsToAdd: number[] = requestedFoodIds.filter(
        (id) => !currentFoodIds.includes(id)
      );

      const foodIdsToRemove: number[] = currentFoodIds.filter(
        (id) => !requestedFoodIds.includes(id)
      );

      let updatedMeal: MealWithFoodsArrayNumber = {
        id: mealId,
        name: meal.name,
        isMeal: 1,
        portion: meal.portion,
        protein: meal.protein,
        calories: meal.calories,
        grease: meal.grease,
        salt: meal.salt,
        foods: meal.meals_has_foods.map((item) => item.meals_id),
        image: meal.image as string,
      };

      if (name !== undefined && name !== "") {
        updatedMeal.name = name;
      }

      if (image === undefined || image === "") {
        updatedMeal.image = "/default.png";
      }


      //se os 04 ifs abaixo forem do type string..... 
      if (protein !== undefined && protein !== "" && typeof protein === "string") {
        protein = replaceCommaWithDot(protein);
        updatedMeal.protein = parseFloat(protein);
      }

      if (calories !== undefined && calories !== "" && typeof protein === "string") {
        calories = replaceCommaWithDot(calories);
        updatedMeal.calories = parseFloat(calories);
      }

      if (grease !== undefined && grease !== "" && typeof protein === "string") {
        grease = replaceCommaWithDot(grease);
        updatedMeal.grease = parseFloat(grease);
      }

      if (salt !== undefined && salt !== "" && typeof protein === "string") {
        salt = replaceCommaWithDot(salt);
        updatedMeal.salt = parseFloat(salt);
      }

      //se os 04 ifs abaixo forem do type number..... 
      if (protein && protein !== "") {
        updatedMeal.protein = parseFloat(protein);
      }

      if (calories && calories !== "") {
        updatedMeal.calories = parseFloat(calories);
      }

      if (grease && grease !== "") {
        updatedMeal.grease = parseFloat(grease);
      }

      if (salt && salt !== "") {
        updatedMeal.salt = parseFloat(salt);
      }
      //fim 04 ifs


      if (foods_id !== undefined && foods_id.length !== 0) {
        updatedMeal.foods = foods_id;
      }

      if (!foods_id && foods_id.length === 0) {
        res.status(400).json({ error: "FoodIds cant be empty." });
        return;
      }

      let savedMeal = await prisma.meal.update({
        where: {
          id: mealId,
        },
        data: {
          name: updatedMeal.name,
          portion: updatedMeal.portion,
          protein: updatedMeal.protein,
          calories: updatedMeal.calories,
          grease: updatedMeal.grease,
          salt: updatedMeal.salt,
          meals_has_foods: {
            create: foodIdsToAdd.map((foodId: number) => ({
              foods: {
                connect: { id: foodId },
              },
            })),

            deleteMany: foodIdsToRemove.map((foodID) => ({
              foods_id: foodID,
            })),
          },
          image: updatedMeal.image,
        },
      });


      res.status(200).json({ msg: "Meal updated with success:", meal: savedMeal });
      return;
    }

  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteOneMealByUserId = async (req: Request, res: Response) => {

  const mealId = parseInt(req.params.id); // ID do alimento a ser removido

  // getting auth token
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  //taking away the word Bearer
  const token = authorizationHeader.split(" ")[1];

  try {
    //getting user Info Token
    const decodedToken = JWT.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedToken;

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      include: {
        users_has_meals: {
          where: { meals_id: mealId },
        },
      },
    });

    if (!user || user.users_has_meals.length === 0) {
      res
        .status(404)
        .json({ error: "Meal not found or doesn't belong to the user." });
      return;
    }

    const infoNutriDaysWithThisFood = await prisma.infonutriday_has_meals.findMany({
      where: {
        meals_id: mealId
      }
    });

    if (infoNutriDaysWithThisFood.length > 0) {
      res.status(400).json({ error: "Not allowed to remove a meal that belongs to a Infonutri Day" });
      return;
    }

    // removing relationships between foods and meals in meals_has_foods
    await prisma.meals_has_foods.deleteMany({
      where: { meals_id: mealId },
    });

    // removing relationships between foods and users in users_has_foods
    await prisma.users_has_meals.deleteMany({
      where: { meals_id: mealId },
    });

    // excluding meal
    await prisma.meal.delete({
      where: { id: mealId },
    });


    return res.status(200).json({ msg: "Meal removed with success" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/* 
x-www-form-urlencoded

Key: name Value: Carne con patatas; 
Key: portion Value: 100; 
Key: protein Value: 33; 
Key: calories Value: 33; 
Key: grease Value: 33; 
Key: salt Value: 3; 
Key: image Value: ./default.png; 
Key: foods_id[] Value: 8; 
Key: foods_id[] Value: 9;  


*/

/* 

{
    "name": "Carne con patatas",
    "portion": "100",
    "protein": "33",
    "calories": "33",
    "grease": "33",
    "salt": "3",
    "image": "./default.png",
    "foods_id": [8, 9]
  } 
  
  */
