import { Request, Response } from "express";
import prisma from "../libs/prismaClient";
import { Food } from "../types/Food";
import { replaceCommaWithDot } from "../utilities/formatter";
import JWT, { JwtPayload } from "jsonwebtoken";
import { Meal } from "@prisma/client";
import { MealWithFoodsArrayNumber } from "../types/Meal";

//getting all infonutriday that have this food
const infonutridays = await prisma.infonutriday_has_meals.findMany({
    where: { meals_id: mealId },
});


for (const infoNutriDayMeal of infonutridays) {
    console.log("infoNutriDayFood: ", infoNutriDayMeal)
    console.log("infoNutriDayFoodType: ", typeof (infoNutriDayMeal))

    const infoNutriDayId = infoNutriDayMeal.infonutriday_id; //pegar o id para saber qual meal vai ser recalculado

    //pegar todos meals que possuem esses food
    const infoNutriDaysThatHaveThisFood = await prisma.infonutriday_has_meals.findMany({
        where: { infonutriday_id: infoNutriDayId },
        include: { meals: true },
    });

    // Recalcule os valores agregados
    let totalPortion = 0;
    let totalProtein = 0;
    let totalCalories = 0;
    let totalGrease = 0;
    let totalSalt = 0;


    for (const infodayMeal of infoNutriDaysThatHaveThisFood) {
        //para cada infodayFood que possuem esse food, vamos criar uma variavel, essa variavel vai ter o valor atual
        totalPortion += infodayMeal.meals.portion;
        totalProtein += infodayMeal.meals.protein
        totalCalories += infodayMeal.meals.calories
        totalGrease += infodayMeal.meals.grease
        totalSalt += infodayMeal.meals.salt
    }

    // Atualize o InfoNutriDay com os novos valores agregados
    await prisma.infonutriday.update({
        where: { id: infoNutriDayId },
        data: {
            portion: totalPortion,
            protein: totalProtein,
            calories: totalCalories,
            grease: totalGrease,
            salt: totalSalt,
        }
    });

}