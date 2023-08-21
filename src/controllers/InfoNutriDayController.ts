import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import { Food } from '../types/Food'
import { replaceCommaWithDot } from '../utilities/formatter'
import JWT, { JwtPayload } from 'jsonwebtoken';
import { Meal } from '@prisma/client';
import { MealWithFoodsArrayNumber } from '../types/Meal';
import { createArrayOfObjects } from '../utilities/others';


interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
    // Adicione outras propriedades que você espera do token
}

/* id                     String                  @id @db.VarChar(45)
  date                   DateTime                @db.Date
  protein                Float                   @db.Float
  calories               Float                   @db.Float
  grease                 Float                   @db.Float
  salt                   Float                   @db.Float
  finalizedDay           Int                     @db.TinyInt
  infonutriday_has_meals infonutriday_has_meals? */

export const createInfoNutriDay = async (req: Request, res: Response) => {

    let { id, date, portion, protein, calories, grease, salt, finalizedDay, meals_id, foods_id } = req.body;

    //transforming string array in number array
    foods_id = foods_id.map((id: string) => parseInt(id));
    meals_id = meals_id.map((id: string) => parseInt(id));

    let foods_id_array_objects = createArrayOfObjects(foods_id);
    let meals_id_array_objects = createArrayOfObjects(meals_id);



    if (finalizedDay) {
        finalizedDay = "false" ? 0 : 1;
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
        });

        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const newInfoNutriDay = await prisma.infonutriday.create({
            data: {
                id,
                date,
                portion,
                protein: parseFloat(protein),
                calories: parseFloat(calories),
                grease: parseFloat(grease),
                salt: parseFloat(salt),
                finalizedDay,
            },
        });

        const meals = await prisma.meal.findMany({
            where: {
                id: {
                    in: meals_id,
                },
            },
        });

        const foods = await prisma.food.findMany({
            where: {
                id: {
                    in: foods_id,
                },
            },
        });

        // Conectando as refeições e alimentos ao InfoNutriDay
        /*  
        await prisma.infonutriday.update({
             where: {
                 id: newInfoNutriDay.id,
             },
             data: {
                 meals: {
                     connect: meals.map((meal) => ({
                         id: meal.id,
                     })),
                 },
                 foods: {
                     connect: foods.map((food) => ({
                         id: food.id,
                     })),
                 },
             },
         }); 
         */

        await prisma.infonutriday.update({
            where: {
                id: newInfoNutriDay.id,
            },
            data: {
                infonutriday_has_meals: {
                   
                }
            },
        });






        res.status(200).json({ msg: "InfoNutriDay created with success:", infoNutriDay: newInfoNutriDay });
        return;

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}


/* 

Exemplo de requisicao em x-www-form-urlencoded

id: 17-ago-2023,
date: 2023-08-16T22:00:00.000Z,
protein: 33,
calories: 33,
grease: 33,
salt: 33,
finalizedDay: false,
foods_id[] : 1,
foods_id[] : 2,
meals_id[] : 1,
meals_id[] : 2 

*/