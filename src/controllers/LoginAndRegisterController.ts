import { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "../libs/prismaClient";
import bcrypt from "bcrypt";

import JWT from "jsonwebtoken";

dotenv.config();

export const signUp = async (req: Request, res: Response) => {
  let { name, email, password, isAdmin = false } = req.body;

  if (email.length < 5 || password.length < 3) {
    res.status(500).json({ error: "Could not register, email or password too short." });
    return;
  }

  if (email.length > 0 && password.length > 0) {
    let hasUser = await prisma.user.findUnique({ where: { email } });

    if (hasUser) {
      res
        .status(400)
        .json({ error: "Could not register, email already exists." });
      return;
    }

    if (!hasUser) {
      let encryptedPassword = await bcrypt.hash(password, 10);

      if (encryptedPassword) {
        let newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: encryptedPassword,
            isAdmin: isAdmin === 1 ? 1 : 0,
          },
        });


        const token = JWT.sign(
          {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
          },
          process.env.JWT_SECRET_KEY as string,
          {
            expiresIn: "30d",
          }
        );

        res.status(201);
        res.json({ id: newUser.id, token });
        return;
      }
    }
  }
};

export const login = async (req: Request, res: Response) => {
  let { email, passwordReq } = req.body;

  let user = await prisma.user.findUnique({ where: { email } });
  console.log("user: ", user);

  if (!user) {
    res.json({ error: "User with this email/password does not exist" });
    return;
  }

  if (user) {
    try {
      // Remover a senha do objeto user antes de enviar a resposta
      const { password, ...userWithoutPassword } = user;


      const matchedPasswords = await bcrypt.compare(passwordReq, password);

      //tasd
      if (!matchedPasswords) {
        res.json({ msg: "Incorrect email or password" });
        return;
      }

      if (matchedPasswords) {
        const token = JWT.sign(
          { id: user.id, email: user.email, password: user.password },
          process.env.JWT_SECRET_KEY as string,
          {
            expiresIn: "30d",
          }
        );

        res.json({
          msg: "Logged in successfully",
          user: userWithoutPassword,
          status: true,
          token,
        });
        return;
      }
    } catch (err) {
      console.log(err);
      res.json({ msg: "Unable to log in", status: false });
      return;
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "Token not provided." });
  }

  //removendo apenas o token, mas ele ainda assim é valido
  const token = authorization.replace("Bearer ", "");

  return res.status(200).json({ msg: "Token successfully removed", token });
};
