import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import { Food } from '../types/Food'


export const getFoods = async (req: Request, res: Response) => {
    let foods = await prisma.food.findMany();

    if (foods) {
        res.status(200).json(foods);
        return;
    }

    else {
        res.status(404).json({ error: "foods not found." })
        return;
    }

}

export const getOneFood = async (req: Request, res: Response) => {

    const { id } = req.params;

    let food = await prisma.food.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (food) {
        res.status(200).json(food);
        return;
    }

    else {
        res.status(404).json({ error: `food with ID: ${id} not found` })
    }

}

export const createFood = async (req: Request, res: Response) => {

    const { name, portion, protein, calories, grease, salt, image = "/default.png" } = req.body;


    try {
        const newFood = await prisma.food.create({
            data: {
                name,
                portion: parseInt(portion),
                protein: parseFloat(protein),
                calories: parseFloat(calories),
                grease: parseFloat(grease),
                salt: parseFloat(salt),
                image
            },
        });

        res.status(200).json({ msg: "Food created with success:", food: newFood });
        return

    } catch (error) {
        res.status(500).json({ err: error })
        return
    }

}

export const updateFood = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { name, portion, protein, calories, grease, salt, image = "/default.png" } = req.body;

    let food = await prisma.food.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (!food) {
        res.status(404).json({ error: `Food with ID: ${id} doesnt exists` });
        return;
    }

    if (!portion && !protein && !calories && !grease && !salt) {
        res.json({ msg: "Unable to update, please enter a field to be updated." });
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

        if (name) updatedFood.name = name;
        if (portion) updatedFood.portion = portion;
        if (protein) updatedFood.protein = protein;
        if (calories) updatedFood.calories = calories;
        if (grease) updatedFood.grease = grease;
        if (salt) updatedFood.salt = salt;
        if (image) updatedFood.image = image;


        try {
            let savedFood = await prisma.food.update({
                where: {
                    id: parseInt(id)
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

            });

            res.status(200).json({ msg: "Food updated with success:", food: savedFood });
            return

        } catch (error) {
            res.status(500).json({ err: error })
            return
        }


    }


}

export const deleteOneFood = async (req: Request, res: Response) => {

    const { id } = req.params;

    let food = await prisma.food.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    if (food) {
        await prisma.food.delete({
            where: {
                id: food.id
            }
        })
        res.status(200).json({ msg: `Food with ID: ${id} removed with success.` });
        return;
    }

    else {
        res.status(404).json({ error: `food with ID: ${id} not found` })
    }

}




/* export const createUser = async (req: Request, res: Response) => {

    const { name, email, password, isAdmin = false } = req.body;


    try {
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password,
                isAdmin: isAdmin === 'true' ? true : false
            },
        })

        res.status(201).json({ msg: 'user created with success', newUser });

    }
    catch (error) {
        console.log("ERROR: ", error)
        res.status(500).json({ error: "Error creating user", msg: error });
    }

} */