import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import { replaceCommaWithDot } from '../utilities/formatter'
import JWT, { JwtPayload } from 'jsonwebtoken';
import { InfoNutriDayType } from '../types/InfoNutriDay';
import { countRepetitions, removeDuplicatesFromArray, countSameNumbers } from '../utilities/getIds';
import { KeyAndCount } from '../types/KeyAndCountType';


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
    let infoNutriDayIdFirstPartDate = infoNutriDayId.substring(0, 10)
    console.log(infoNutriDayIdFirstPartDate)

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
                    where: {
                        infonutriday_id: {
                            startsWith: infoNutriDayIdFirstPartDate
                        }
                    }
                }
            }
        });

        if (!user || user.infonutriday_has_users.length === 0) {
            res.status(200).json({ msgError: "InfoNutriDay not found or doesn't belong to the user." });
            return;
        }


        // details about the infoNutriDay to be updated
        const infoNutriDay = await prisma.infonutriday.findFirst({
            where: {
                id: {
                    startsWith: infoNutriDayIdFirstPartDate
                }
            },
            include: {
                infonutriday_has_foods: true,
                infonutriday_has_meals: true,
            }
        });


        if (!infoNutriDay) {
            res.status(200).json({ msgError: "InfoNutriDay does not exists." });
            return;
        }


        const foodsInfoNutriDay = await prisma.infonutriday_item_food.findMany({
            where: {
                infonutriday_id: {
                    startsWith: infoNutriDayIdFirstPartDate
                }
            }
        })

        const mealsInfoNutriDay = await prisma.infonutriday_item_meal.findMany({
            where: {
                infonutriday_id: {
                    startsWith: infoNutriDayIdFirstPartDate
                }
            }
        });


        // Combine os objetos em um único objeto
        const responseObj = {
            infoNutriDay: infoNutriDay,
            foodsInfoNutriDay: foodsInfoNutriDay,
            mealsInfoNutriDay: mealsInfoNutriDay
        };


        res.status(200).json(responseObj);
        return;

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }


};


export const createInfoNutriDay = async (req: Request, res: Response) => {

    let { id, date, portion, protein, calories, grease, salt, finalizedDay, meals_id = null, foods_id = null } = req.body;

    let idFoodsWithManyIds: KeyAndCount[] = [];
    let idMealsWithManyIds: KeyAndCount[] = [];


    if (foods_id !== undefined || foods_id !== null && foods_id.length !== 0) {
        foods_id = foods_id.map((id: string) => parseInt(id));
    }

    if (meals_id !== undefined || meals_id !== null && meals_id.length !== 0) {
        meals_id = meals_id.map((id: string) => parseInt(id));
    }

    if (foods_id.some(isNaN)) { //colocando valor null se nao for enviado foods_id
        foods_id = null
    }

    if (foods_id) {
        console.log("foods_id antes de remover duplicates: ", foods_id)
        idFoodsWithManyIds = countSameNumbers(foods_id)
        console.log("idFoodsWithManyIds:", idFoodsWithManyIds)
        foods_id = removeDuplicatesFromArray(foods_id)
        console.log("foods_id depois de remover duplicates: ", foods_id)
    }

    if (meals_id.some(isNaN)) { //colocando valor null se nao for enviado meals_id
        meals_id = null
    }

    if (meals_id) {
        console.log("meals_id antes de remover duplicates: ", meals_id)
        idMealsWithManyIds = countSameNumbers(meals_id)
        console.log("idFoodsWithManyIds", idFoodsWithManyIds)
        meals_id = removeDuplicatesFromArray(meals_id);
        console.log("meals_id dps de remover duplicates: ", meals_id)
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



        const newInfoNutriDay = await prisma.$transaction([
            prisma.infonutriday.create({
                data: {
                    id: idWithTimeStamp,
                    date,
                    portion,
                    protein: parseFloat(protein),
                    calories: parseFloat(calories),
                    grease: parseFloat(grease),
                    salt: parseFloat(salt),
                    finalizedDay,


                    infonutriday_has_foods: foods_id ? {
                        create: foods_id.map((foodId: number) => ({
                            foods: {
                                connect: {
                                    id: foodId,
                                },
                            },
                        })),
                    } : undefined,

                    infonutriday_has_meals: meals_id ? {
                        create: meals_id.map((mealId: number) => ({
                            meals: {
                                connect: {
                                    id: mealId,
                                },
                            },
                        })),
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

                    infonutriday_has_foods: {
                        include: {
                            foods: true
                        }
                    },

                    infonutriday_has_meals: {
                        include: {
                            meals: true
                        }
                    },
                }

            }),

        ])

        if (idFoodsWithManyIds.length > 0) {
            idFoodsWithManyIds.forEach(async (item) => {

                await prisma.infonutriday_item_food.create({
                    data: {
                        infonutriday_id: idWithTimeStamp,
                        food_id: item.key,
                        qtde: item.count,
                    }
                })

            });
        }

        if (idMealsWithManyIds.length > 0) {
            idMealsWithManyIds.forEach(async (item) => {

                await prisma.infonutriday_item_meal.create({
                    data: {
                        infonutriday_id: idWithTimeStamp,
                        meal_id: item.key,
                        qtde: item.count,
                    }
                })

            });
        }


        res.status(200).json({ msg: "InfoNutriDay created with success:", infoNutriDay: newInfoNutriDay });
        return;

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const updateInfoNutriDay = async (req: Request, res: Response) => {

    let { id, date, portion, protein, calories, grease, salt, finalizedDay, meals_id = null, foods_id = null } = req.body;

    const infoNutriDayId = req.params.id;

    //to control itemsQuantity
    let idFoodsWithManyIds: KeyAndCount[] = [];
    let idMealsWithManyIds: KeyAndCount[] = [];

    //transforming string array in number array

    if (foods_id !== undefined || foods_id !== null && foods_id.length !== 0) {
        foods_id = foods_id.map((id: string) => parseInt(id));
    }

    if (meals_id !== undefined || meals_id !== null && meals_id.length !== 0) {
        meals_id = meals_id.map((id: string) => parseInt(id));
    }

    if (foods_id.some(isNaN)) {
        let arraynumber: number[] = [];
        foods_id = arraynumber;
    }

    if (foods_id) {
        console.log("foods_id antes de remover duplicates: ", foods_id)
        idFoodsWithManyIds = countSameNumbers(foods_id)
        console.log("idFoodsWithManyIds:", idFoodsWithManyIds)
        foods_id = removeDuplicatesFromArray(foods_id)
        console.log("foods_id depois de remover duplicates: ", foods_id)
    }

    if (meals_id.some(isNaN)) {
        let arraynumber: number[] = [];
        meals_id = arraynumber;
    }

    if (meals_id) {
        console.log("meals_id antes de remover duplicates: ", meals_id)
        idMealsWithManyIds = countSameNumbers(meals_id)
        console.log("idFoodsWithManyIds", idFoodsWithManyIds)
        meals_id = removeDuplicatesFromArray(meals_id);
        console.log("meals_id dps de remover duplicates: ", meals_id)
    }

    if (finalizedDay) {
        finalizedDay = "true" ? 1 : 0;
    }

    if (!portion && !protein && !calories && !grease && !salt && foods_id.length === 0 && meals_id.length === 0) {
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
        console.log("decodedToken ", decodedToken)

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            include: {
                infonutriday_has_users: true
            }
        });

        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }


        //getting infoNutriDay to update
        const infoNutriDay = await prisma.infonutriday.findUnique({
            where: { id: infoNutriDayId },
            include: {
                infonutriday_has_users: true,
            },
        });

        if (!infoNutriDay) {
            res.status(404).json({ error: "infoNutriDay not found." });
            return;
        }

        if (infoNutriDay) {

            console.log("infoNutriDay", infoNutriDay)

            const foods = await prisma.infonutriday_has_foods.findMany({
                where: {
                    infonutriday_id: infoNutriDay.id,
                },
                include: {
                    foods: true,
                },
            });

            const foodsWithQuantity = await prisma.infonutriday_item_food.findMany({
                where: {
                    infonutriday_id: infoNutriDay.id
                }
            })

            console.log("foodsWithQuantity", foodsWithQuantity)
            console.log("foods", foods)

            const meals = await prisma.infonutriday_has_meals.findMany({
                where: {
                    infonutriday_id: infoNutriDay.id,
                },
                include: {
                    meals: true,
                },
            });

            const mealsWithQuantity = await prisma.infonutriday_item_meal.findMany({
                where: {
                    infonutriday_id: infoNutriDay.id
                }
            })

            console.log("meals", mealsWithQuantity)


            const requestedFoodIds: number[] = foods_id;
            console.log("requestedFoodIds", requestedFoodIds)



            // Get the food IDs currently associated with the meal
            const currentFoodIds = foods.map((item) => item.foods.id);
            console.log("currentFoodIds", currentFoodIds)

            // Calculate the food IDs to be added and removed
            //criando um array novo filtrando os foods que NAO estao em currentFoodIds
            const foodIdsToAdd: number[] = requestedFoodIds.filter(
                (id) => !currentFoodIds.includes(id)
            );
            console.log("foodIdsToAdd", foodIdsToAdd)

            const foodIdsToRemove: number[] = currentFoodIds.filter(
                (id) => !requestedFoodIds.includes(id)
            );
            console.log("foodIdsToRemove", foodIdsToRemove)


            const requestedMealsIds: number[] = meals_id;
            console.log("requestedMealsIds", requestedMealsIds)

            // Get the food IDs currently associated with the meal
            const currentMealsIds = meals.map((item) => item.meals.id);
            console.log("currentMealsIds", currentMealsIds)

            // Calculate the food IDs to be added and removed
            const mealIdsToAdd: number[] = requestedMealsIds.filter(
                (id) => !currentMealsIds.includes(id)
            );
            console.log("mealIdsToAdd", mealIdsToAdd)


            const mealIdsToRemove: number[] = currentMealsIds.filter(
                (id) => !requestedMealsIds.includes(id)
            );
            console.log("mealIdsToRemove", mealIdsToRemove)



            let updatedInfoNutriDay: InfoNutriDayType = {
                id: infoNutriDayId,
                date: infoNutriDay.date,
                portion: infoNutriDay.portion,
                protein: infoNutriDay.protein,
                calories: infoNutriDay.calories,
                grease: infoNutriDay.grease,
                salt: infoNutriDay.salt,
                finalizedDay: infoNutriDay.finalizedDay,
                foods: currentFoodIds,
                meals: currentMealsIds

            }

            console.log("updatedInfoNutriDay", updatedInfoNutriDay)

            //nao é necessario atualizar a data.
            // if (date !== undefined || date !== "") {
            //     updatedInfoNutriDay.date = date;
            // }

            if (portion !== undefined || portion !== "") {
                updatedInfoNutriDay.portion = parseFloat(portion)
            }

            if (protein !== undefined && protein !== "" && typeof protein === "string") {
                protein = replaceCommaWithDot(protein);
                updatedInfoNutriDay.protein = parseFloat(protein);
            }

            if (calories !== undefined && calories !== "" && typeof protein === "string") {
                calories = replaceCommaWithDot(calories);
                updatedInfoNutriDay.calories = parseFloat(calories);
            }

            if (grease !== undefined && grease !== "" && typeof protein === "string") {
                grease = replaceCommaWithDot(grease);
                updatedInfoNutriDay.grease = parseFloat(grease);
            }

            if (salt !== undefined && salt !== "" && typeof protein === "string") {
                salt = replaceCommaWithDot(salt);
                updatedInfoNutriDay.salt = parseFloat(salt);
            }

            if (finalizedDay !== undefined && finalizedDay !== "") {
                updatedInfoNutriDay.finalizedDay = finalizedDay;
            }

            if (foods_id !== undefined && foods_id.length !== 0) {
                updatedInfoNutriDay.foods = foods_id;
            }

            if (meals_id !== undefined && meals_id.length !== 0) {
                updatedInfoNutriDay.meals = meals_id;
            }

            if (foods_id.length === 0 && meals_id.length === 0) {
                res.status(400).json({ error: "FoodIds and MealsId cant be both empty." });
                return;
            }

            console.log("updatedInfoNutriDayAfterUpdate", updatedInfoNutriDay)

            console.log("foodIdsToAdd", foodIdsToAdd)

            //removed all meals and foods
            let savedInfoNutriDay = await prisma.infonutriday.update({
                where: {
                    id: infoNutriDayId,
                },
                data: {
                    date: date !== null && date !== undefined && date !== "" ? new Date(updatedInfoNutriDay.date.toString()) : infoNutriDay.date,
                    portion: updatedInfoNutriDay.portion,
                    protein: updatedInfoNutriDay.protein,
                    calories: updatedInfoNutriDay.calories,
                    grease: updatedInfoNutriDay.grease,
                    salt: updatedInfoNutriDay.salt,
                    finalizedDay: updatedInfoNutriDay.finalizedDay,
                    infonutriday_has_foods: {
                        deleteMany: foodIdsToRemove.map((foodID) => ({
                            foods_id: foodID,
                        })),

                    },
                    infonutriday_has_meals: {
                        deleteMany: mealIdsToRemove.map((mealID) => ({
                            meals_id: mealID,
                        })),
                    },
                }
            });


            //adding all meals and foods
            savedInfoNutriDay = await prisma.infonutriday.update({
                where: {
                    id: infoNutriDayId
                },
                data: {
                    infonutriday_has_foods: {
                        create: foodIdsToAdd.map((foodId: number) => ({
                            foods: {
                                connect: { id: foodId },
                            },
                        })),
                    },

                    infonutriday_has_meals: {
                        create: mealIdsToAdd.map((mealId: number) => ({
                            meals: {
                                connect: { id: mealId },
                            },
                        })),
                    }
                }
            })


            if (idFoodsWithManyIds.length >= 0) {
                await prisma.infonutriday_item_food.deleteMany({
                    where: {
                        infonutriday_id: infoNutriDayId
                    }
                })

                idFoodsWithManyIds.forEach(async (item) => {
                    await prisma.infonutriday_item_food.create({
                        data: {
                            infonutriday_id: infoNutriDay.id,
                            food_id: item.key,
                            qtde: item.count,
                        }
                    })

                });
            }

            if (idMealsWithManyIds.length >= 0) {
                await prisma.infonutriday_item_meal.deleteMany(
                    {
                        where: {
                            infonutriday_id: infoNutriDayId
                        }
                    }
                )

                idMealsWithManyIds.forEach(async (item) => {
                    await prisma.infonutriday_item_meal.create({
                        data: {
                            infonutriday_id: infoNutriDay.id,
                            meal_id: item.key,
                            qtde: item.count,
                        }
                    })

                });
            }

            res.status(200).json({ msg: "InfoNutriDay updated with success:", meal: savedInfoNutriDay });
            return;

        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ error: "Internal server error." });
    }
}


export const deleteOneInfonutridayByUserId = async (req: Request, res: Response) => {

    const infonutridayId = req.params.id; // ID do alimento a ser atualizado

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
                infonutriday_has_users: {
                    where: { infonutriday_id: infonutridayId },
                },
            },
        });

        if (!user) {
            res.status(404).json({ error: "Infonutriday not found or doesn't belong to the user." });
            return;
        }

        // removing relationships between foods and meals in meals_has_foods
        await prisma.infonutriday_has_foods.deleteMany({
            where: { infonutriday_id: infonutridayId },
        });

        await prisma.infonutriday_has_meals.deleteMany({
            where: { infonutriday_id: infonutridayId },
        });

        await prisma.infonutriday_has_users.deleteMany({
            where: { infonutriday_id: infonutridayId },
        });

        // excluding meal
        await prisma.infonutriday.delete({
            where: { id: infonutridayId },
        });


        return res.status(200).json({ msg: "infoNutriDay removed with success" });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

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

/* 

Exemplo de requisicao para atualizar em x-www-form-urlencoded

http://localhost:5000/api/infoNutriDay/04-ene-2024+1706727264609

date: 
portion: 100,
protein: 20,
calories: 
grease: 
salt: 
finalizedDay: true,
foods_id[] : 4 
meals_id[] : 2


*/