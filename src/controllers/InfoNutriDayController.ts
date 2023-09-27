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

/*   id                     String                   @id @db.VarChar(45)
  date                   DateTime                 @db.Date
  portion                Float                    @db.Float
  protein                Float                    @db.Float
  calories               Float                    @db.Float
  grease                 Float                    @db.Float
  salt                   Float                    @db.Float
  finalizedDay           Int                      @db.TinyInt
  infonutriday_has_foods infonutriday_has_foods?
  infonutriday_has_meals infonutriday_has_meals?
  infonutriday_has_users infonutriday_has_users[]
  
  */

export const createInfoNutriDay = async (req: Request, res: Response) => {

    let { id, date, portion, protein, calories, grease, salt, finalizedDay, meals_id = null, foods_id = null } = req.body;

    //transforming string array in number array
    foods_id = foods_id.map((id: string) => parseInt(id));
    meals_id = meals_id.map((id: string) => parseInt(id));

    console.log("foodsid39", foods_id)
    console.log("mealsid39", meals_id)


    if (finalizedDay) {
        finalizedDay = "false" ? 0 : 1;
    }

    if (portion !== undefined && portion !== "" && typeof portion === "string") {
        portion = replaceCommaWithDot(portion);
        portion = parseFloat(portion);
    }

    if (protein !== undefined && protein !== "" && typeof protein === "string") {
        protein = replaceCommaWithDot(protein);
        protein = parseFloat(protein);
    }

    if (calories !== undefined && calories !== "" && typeof protein === "string") {
        calories = replaceCommaWithDot(calories);
        calories = parseFloat(calories);
    }

    if (grease !== undefined && grease !== "" && typeof protein === "string") {
        grease = replaceCommaWithDot(grease);
        grease = parseFloat(grease);
    }

    if (salt !== undefined && salt !== "" && typeof protein === "string") {
        salt = replaceCommaWithDot(salt);
        salt = parseFloat(salt);
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

                infonutriday_has_foods: {
                    create: foods_id.map((foodId: number) => ({
                        foods: {
                            connect: {
                                id: foodId
                            }
                        }
                    }))
                },

                infonutriday_has_meals: {
                    create: meals_id.map((mealId: number) => ({
                        meals: {
                            connect: {
                                id: mealId
                            }
                        }
                    }))
                },

                infonutriday_has_users: {
                    create: {
                        users: {
                            connect: {
                                id: decodedToken.id,
                            },
                        },
                    },
                },

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