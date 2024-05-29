import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import { Food } from '../types/Food'
import { formatToNumber, replaceCommaWithDot } from '../utilities/formatter'
import JWT, { JwtPayload } from 'jsonwebtoken';


interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
}


//CRUD BY USER ID

export const getFoodsByUserId = async (req: Request, res: Response) => {

    // getting Auth Token
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }

    const token = authorizationHeader.split(" ")[1]; // Obtém o token sem o "Bearer" //gera um array onde foi feito o split


    try {
        //getting user info JWT
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            include: {
                users_has_foods: {
                    include: {
                        foods: true
                    }
                }
            }
        });


        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        //new array with foods user
        const userFoods = user.users_has_foods.map(uhf => uhf.foods);

        res.status(200).json(userFoods);
        return;

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const getOneFoodByUserId = async (req: Request, res: Response) => {

    const foodId = parseInt(req.params.id);

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
                users_has_foods: {
                    where: { foods_id: foodId }
                }
            }
        });

        if (!user || user.users_has_foods.length === 0) {
            res.status(404).json({ error: "Food not found or doesn't belong to the user." });
            return;
        }


        // details about the food to be updated
        const food = await prisma.food.findUnique({
            where: { id: foodId }
        });

        if (!food) {
            res.status(404).json({ error: "Food not found." });
            return;
        }

        res.status(200).json(food);
        return;

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const createFoodsByUserId = async (req: Request, res: Response) => {

    let { name, portion, protein, calories, grease, salt, image = "/default.png" } = req.body;


    if (!name || !portion || !protein || !calories || !grease || !salt) {
        res.status(400).json({ error: "Information provided doenst fullfill request." })
        return;
    }

    if (image === undefined || image === "") {
        image = "/default.png";
    }

    if (protein !== undefined && protein !== "" && protein !== null && typeof protein === "string") {
        console.log("Entrou en Protein!")
        protein.toString();
        protein = replaceCommaWithDot(protein);
    }

    if (calories !== undefined && calories !== "" && calories !== null && typeof calories === "string") {
        console.log("Entrou en Calories!")
        calories.toString();
        calories = replaceCommaWithDot(calories);
    }

    if (grease !== undefined && grease !== "" && grease !== null && typeof grease === "string") {
        grease.toString();
        grease = replaceCommaWithDot(grease);
    }

    if (salt !== undefined && salt !== "" && salt !== null && typeof salt === "string") {
        salt.toString();
        salt = replaceCommaWithDot(salt);
    }

    // authToken Header
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }

    const token = authorizationHeader.split(" ")[1];

    try {
        //user info token JWT
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
        });

        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const newFood = await prisma.food.create({
            data: {
                name,
                portion: parseInt(portion),
                protein: parseFloat(protein),
                calories: parseFloat(calories),
                grease: parseFloat(grease),
                salt: parseFloat(salt),
                image,
                users_has_foods: {
                    create: {
                        users: {
                            connect: {
                                id: decodedToken.id
                            }
                        }
                    }
                }
            },
        });

        res.status(200).json({ msg: "Food created with success:", food: newFood });
        return

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const updateFoodByUserId = async (req: Request, res: Response) => {

    const foodId = parseInt(req.params.id);
    let { portion, protein, calories, grease, salt, image = "/default.png" } = req.body;


    if (!portion && !protein && !calories && !grease && !salt) {
        res.status(400).json({ msg: "Unable to update, please enter a field to be updated." });
        return;
    }

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }

    const token = authorizationHeader.split(" ")[1];

    try {
        //user info token JWT
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            include: {
                users_has_foods: {
                    where: { foods_id: foodId }
                }
            }
        });

        if (!user || user.users_has_foods.length === 0) {
            res.status(404).json({ error: "Food not found or doesn't belong to the user." });
            return;
        }

        //updated food based on what user is logged
        // getting details about the food to be updated
        const food = await prisma.food.findUnique({
            where: { id: foodId }
        });

        if (!food) {
            res.status(404).json({ error: "Food not found." });
            return;
        }

        if (food) {
            let updatedFood: Food = {
                id: food.id,
                name: food.name,
                portion: food.portion,
                protein: food.protein,
                calories: food.calories,
                grease: food.grease,
                salt: food.salt,
                image: food.image as string

            }


            if (portion) updatedFood.portion = parseInt(portion);

            if (protein !== undefined) {

                if (typeof (protein) === "string") {
                    protein = replaceCommaWithDot(protein);
                }

                updatedFood.protein = parseFloat(protein);
            }

            if (calories !== undefined) {

                if (typeof (calories) === "string") {
                    calories = replaceCommaWithDot(calories);
                }

                updatedFood.calories = parseFloat(calories);
            }

            if (grease !== undefined) {

                if (typeof (grease) === "string") {
                    grease = replaceCommaWithDot(grease);
                }

                updatedFood.grease = parseFloat(grease);
            }

            if (salt !== undefined) {

                if (typeof (salt) === "string") {
                    salt = replaceCommaWithDot(salt);
                }

                updatedFood.salt = parseFloat(salt);
            }

            if (image !== undefined) updatedFood.image = image;

            let savedFood = await prisma.food.update({
                where: {
                    id: foodId
                },
                data: {
                    name: updatedFood.name,
                    portion: updatedFood.portion,
                    protein: updatedFood.protein,
                    calories: updatedFood.calories,
                    grease: updatedFood.grease,
                    salt: updatedFood.salt,
                    image: updatedFood.image
                }

            })


            //updating all meals that have this food.
            //getting all meals that have this food.
            const meals = await prisma.meals_has_foods.findMany({
                where: { foods_id: foodId },
                include: { foods: true }
            });

            //para cada food presente em todas refeicoes executar o for
            for (const mealFood of meals) {
                console.log("mealFood: ",mealFood)
                const mealId = mealFood.meals_id; //pegar o id para saber qual meal vai ser recalculado

                //pegar todos meals que possuem esses food
                const mealFoods = await prisma.meals_has_foods.findMany({
                    where: { meals_id: mealId },
                    include: { foods: true },
                });

                // Recalcule os valores agregados
                let totalProtein = 0;
                let totalCalories = 0;
                let totalGrease = 0;
                let totalSalt = 0;

                for (const mf of mealFoods) {
                    console.log("MF1 :", mf)
                    totalProtein += mf.foods.protein;
                    totalCalories += mf.foods.calories;
                    totalGrease += mf.foods.grease;
                    totalSalt += mf.foods.salt;
                    console.log("MF2 :", mf)
                }

                // Atualize o Meal com os novos valores agregados
                await prisma.meal.update({
                    where: { id: mealId },
                    data: {
                        protein: totalProtein,
                        calories: totalCalories,
                        grease: totalGrease,
                        salt: totalSalt,
                    },
                });
            }



            res.status(200).json({ msg: "Food updated with success:", food: savedFood });
            return

        }

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const deleteOneFoodByUserId = async (req: Request, res: Response) => {

    const foodId = parseInt(req.params.id);

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }

    const token = authorizationHeader.split(" ")[1];

    try {
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            include: {
                users_has_foods: {
                    where: { foods_id: foodId }
                }
            }
        });

        if (!user || user.users_has_foods.length === 0) {
            res.status(404).json({ error: "Food not found or doesn't belong to the user." });
            return;
        }

        // Verificar se há refeições associadas a este alimento
        const mealsWithFood = await prisma.meals_has_foods.findMany({
            where: { foods_id: foodId }
        });

        if (mealsWithFood.length > 0) {
            // O alimento está associado a pelo menos uma refeição
            res.status(200).json({ error: "Food is associated with meals. Cannot delete." });
            return;
        }

        // removing relationships between foods and users in users_has_foods
        await prisma.users_has_foods.deleteMany({
            where: { foods_id: foodId },
        });

        // Exclua o alimento
        await prisma.food.delete({
            where: { id: foodId }
        });

        return res.status(200).json({ msg: "Food removed with success" });


    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}



