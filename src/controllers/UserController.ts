import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';



export const ping = async (req: Request, res: Response) => {
    res.json({ res: 'pong' });
}


export const getUsers = async (req: Request, res: Response) => {
    let users = await prisma.user.findMany();

    if (users) {
        res.status(200).json(users);
    }

    else {
        res.status(404).json({ error: "users not found." })
    }

    return users;
}

export const createUser = async (req: Request, res: Response) => {

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

}