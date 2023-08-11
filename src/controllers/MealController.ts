import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import { Food } from '../types/Food'
import { replaceCommaWithDot } from '../utilities/formatter'
import JWT, { JwtPayload } from 'jsonwebtoken';


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
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;
        // Agora você pode acessar os dados do usuário do token, como decodedToken.id e decodedToken.email

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            include: {
                users_has_meals: {
                    include: {
                        meals: true
                    }
                }
            }
        });

        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        //map criando array de meals do usuario
        const userMeals = user.users_has_meals.map(item => item.meals);

        res.status(200).json(userMeals);
        return;

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}


export const createMealByUserId = async (req: Request, res: Response) => {

    let { name, portion, protein, calories, grease, salt, image = "/default.png", foods_id } = req.body;

    console.log(req.body);

    /* REQ.BODY:  {
        name: 'Carne con patatas',
        portion: '100',
        protein: '33',
        calories: '33',
        grease: '33',
        salt: '3',
        image: './default.png',
        foods_id: [ '8', '9' ]
      } */


    console.log("FoodsID Antes: ", foods_id); //['8', '9'] 

    foods_id = foods_id.map((id: string) => parseInt(id)); //executado funcao para transformar os valores do array em numeros
    let foods_id_number: number[] = foods_id; //por algumar razao, em data de createMany nao me permite pegar o foods_id_number, porque?
    console.log("FoodsID depois: ", foods_id); //[8, 9] 

    if (image === undefined || image === "") {
        image = "/default.png";
    }

    if (protein !== undefined && protein !== "" && typeof protein === "string") {
        protein = replaceCommaWithDot(protein);
    }

    if (calories !== undefined && calories !== "" && typeof protein === "string") {
        calories = replaceCommaWithDot(calories);
    }

    if (grease !== undefined && grease !== "" && typeof protein === "string") {
        grease = replaceCommaWithDot(grease);
    }

    if (salt !== undefined && salt !== "" && typeof protein === "string") {
        salt = replaceCommaWithDot(salt);
    }

    if (!foods_id && foods_id.length === 0) {
        res.status(400).json({ error: "FoodIds cant be empty." });
        return;
    }

    // Recupere o token do cabeçalho de autorização
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }

    const token = authorizationHeader.split(" ")[1]; // Obtém o token sem o "Bearer" //gera um array onde foi feito o split

    // Decodifique o token para obter os dados do usuário
    try {
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;
        // Agora você pode acessar os dados do usuário do token, como decodedToken.id e decodedToken.email

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
                meals_has_foods: {
                    createMany: {
                        data: foods_id.map((foodId: number) => ({
                            foods_id: foodId
                        }))
                    }
                },
                users_has_meals: {
                    create: {
                        users: {
                            connect: {
                                id: decodedToken.id
                            }
                        }
                    }
                }

            }, include: {
                meals_has_foods: {
                    include: {
                        foods: true
                    }
                }
            }
        });


        res.status(200).json({ msg: "Food created with success:", meal: newMeal });
        return

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

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