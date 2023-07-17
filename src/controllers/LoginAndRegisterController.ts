import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import JWT from 'jsonwebtoken';

export const signUp = async (req: Request, res: Response) => {

    let { name, email, password, isAdmin = false } = req.body;

    if (email.length > 0 && password.length > 0) {

        let hasUser = await prisma.user.findUnique({ where: { email } });

        if (hasUser) { res.status(500).json({ error: 'Could not register, email already exists.' }); return; }

        if (!hasUser) {
            let newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password,
                    isAdmin: isAdmin === 'true' ? true : false
                }
            })

            const token = JWT.sign({ id: newUser.id, name: newUser.name, email: newUser.email, password: newUser.password },
                process.env.JWT_SECRET_KEY as string,
                {
                    expiresIn: '2h'
                });

            res.status(201);
            res.json({ id: newUser.id, token });
            return;
        }
    }
};

export const login = async (req: Request, res: Response) => {

    let { email, password } = req.body;

    let user = await prisma.user.findUnique({ where: { email, password } });

    if (!user) {
        res.json({ error: "User with this email/password does not exist" });
        return;
    }

    if (user) {

        // Remover a senha do objeto user antes de enviar a resposta
        const { password, ...userWithoutPassword } = user;

        const token = JWT.sign({ id: user.id, email: user.email, password: user.password },
            process.env.JWT_SECRET_KEY as string,
            {
                expiresIn: '2h'
            });

        res.json({ msg: "Logged in successfully", user: userWithoutPassword, status: true, token });
        return;
    }

    res.json({ msg: "Unable to log in", status: false });
    return
};


export const logout = async (req: Request, res: Response) => {

    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: 'Token not provided.' });
    }

    //removendo apenas o token, mas ele ainda assim é valido
    const token = authorization.replace('Bearer ', '');

    return res.status(200).json({ msg: 'Token successfully removed', token })


};