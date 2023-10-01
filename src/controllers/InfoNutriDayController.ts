import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import {v4 as uuidv4} from 'uuid';  
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

export const getAllInfoNutriDay = async (req: Request, res: Response) => {

    // getting authToken
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }

    //taking away the word Bearer
    const token = authorizationHeader.split(" ")[1];

    try {
        //getting user info
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            select: {
                name: true,
                email: true,
                infonutriday_has_users: {
                    select: {
                        infonutriday: {
                            select: {
                                id: true
                            }
                        }
                    }
                }

            }
        });

        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        //map criando array de meals do usuario
        //const userInfoNutriDay = user.map((item) => item.);
        console.log(user);
        res.status(200).json(user);
        return;

    } catch (error) {
        console.error("Error fetching user's infoNutriDay:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getOneInfoNutriDay = async (req: Request, res: Response) => {

    const infoNutriDayId = req.params.id;

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

                infonutriday_has_users: {
                    where: { infonutriday_id: infoNutriDayId }
                }
            }
        });

        if (!user || user.infonutriday_has_users.length === 0) {
            res.status(404).json({ error: "InfoNutriDay not found or doesn't belong to the user." });
            return;
        }

        // details about the infoNutriDay to be updated
        const infoNutriDay = await prisma.infonutriday.findUnique({
            where: { id: infoNutriDayId }
        });

        if (!infoNutriDay) {
            res.status(404).json({ error: "InfoNutriDay not found." });
            return;
        }

        res.status(200).json(infoNutriDay);
        return;

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


export const createInfoNutriDay = async (req: Request, res: Response) => {

    let { id, date, portion, protein, calories, grease, salt, finalizedDay, meals_id = null, foods_id = null } = req.body;

    //transforming string array in number array

    if (foods_id !== undefined || foods_id !== null && foods_id.length !== 0) {
        foods_id = foods_id.map((id: string) => parseInt(id));
    }

    if (meals_id !== undefined || meals_id !== null && meals_id.length !== 0) {
        meals_id = meals_id.map((id: string) => parseInt(id));
    }

    if (foods_id.some(isNaN)) {
        foods_id = null
    }

    if (meals_id.some(isNaN)) {
        meals_id = null
    }

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


    console.log("MEALS ID: ", meals_id);


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

        //generating unique id
        const timestamp = Date.now();
        const idWithTimeStamp = `${id}+${timestamp}`;

        const newInfoNutriDay = await prisma.infonutriday.create({
            data: {
                id: idWithTimeStamp,
                date,
                portion,
                protein: parseFloat(protein),
                calories: parseFloat(calories),
                grease: parseFloat(grease),
                salt: parseFloat(salt),
                finalizedDay,


                foods: foods_id ? {
                    connect: foods_id.map((foodId: number) => ({
                        id: foodId
                    }))
                } : undefined,

                /* foods: {
                    connect: foods_id.map((foodId: number) => ({
                        id: foodId
                    }))
                }, */


                /* foods: {
                   create: foods_id.map((foodId: number) => ({
                       foods: {
                           connect: {
                               id: foodId,
                           }
                       }
                   }))
               },  */

                meals: meals_id ? {
                    connect: meals_id.map((meals_id: number) => ({
                        id: meals_id
                    }))
                } : undefined,

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

            include: {
                foods: {
                    select: {
                        name: true
                    }
                },
                meals: {
                    select: {
                        name: true
                    }
                }
            }
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