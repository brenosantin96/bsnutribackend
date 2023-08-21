import { Request, Response } from 'express';
import prisma from '../libs/prismaClient';
import { Food } from '../types/Food'
import { formatToNumber, replaceCommaWithDot } from '../utilities/formatter'
import JWT, { JwtPayload } from 'jsonwebtoken';


interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
    // Adicione outras propriedades que você espera do token
}

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
        res.status(404).json({ error: `food with ID: ${id} not found` });
        return;
    }

}

export const createFood = async (req: Request, res: Response) => {

    let { name, portion, protein, calories, grease, salt, image = "/default.png" } = req.body;

    if (image === undefined || image === "") {
        image = "/default.png";
    }

    if (protein !== undefined || protein !== "") {
        protein = replaceCommaWithDot(protein);
    }

    if (calories !== undefined || calories !== "") {
        calories = replaceCommaWithDot(calories);
    }

    if (grease !== undefined || grease !== "") {
        grease = replaceCommaWithDot(grease);
    }

    if (salt !== undefined || salt !== "") {
        salt = replaceCommaWithDot(salt);
    }

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
    let { portion, protein, calories, grease, salt, image = "/default.png" } = req.body;

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


        if (portion) updatedFood.portion = parseInt(portion);

        if (protein) {
            protein = replaceCommaWithDot(protein);
            updatedFood.protein = parseFloat(protein);
        }

        if (calories) {
            calories = replaceCommaWithDot(calories);
            updatedFood.calories = parseFloat(calories);
        }

        if (grease) {
            grease = replaceCommaWithDot(grease);
            updatedFood.grease = parseFloat(grease);
        }

        if (salt) {
            salt = replaceCommaWithDot(salt);
            updatedFood.salt = parseFloat(salt);
        }

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
            console.log(error);
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
        try {
            await prisma.food.delete({
                where: {
                    id: food.id
                }
            })
            res.status(200).json({ msg: `Food with ID: ${id} removed with success.` });
            return;

        } catch (error) {
            res.status(500).json(error);
            return;
        }

    }

    else {
        res.status(404).json({ error: `food with ID: ${id} not found` });
        return;
    }

}


//CRUD BY USER ID

export const getFoodsByUserId = async (req: Request, res: Response) => {

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
                users_has_foods: {
                    include: {
                        foods: true
                    }
                }
            }
        });


        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        //map criando array de foods do usuario
        const userFoods = user.users_has_foods.map(uhf => uhf.foods);

        res.status(200).json(userFoods);
        return;

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const getOneFoodByUserId = async (req: Request, res: Response) => {

    const foodId = parseInt(req.params.id); // ID do alimento a ser atualizado 

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
                users_has_foods: {
                    where: { foods_id: foodId }
                }
            }
        });

        if (!user || user.users_has_foods.length === 0) {
            res.status(404).json({ error: "Food not found or doesn't belong to the user." });
            return;
        }


        // Obtenha os detalhes do alimento a ser atualizado
        const food = await prisma.food.findUnique({
            where: { id: foodId }
        });

        if (!food) {
            res.status(404).json({ error: "Food not found." });
            return;
        }

        res.status(200).json(food);
        return;

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const createFoodsByUserId = async (req: Request, res: Response) => {

    let { name, portion, protein, calories, grease, salt, image = "/default.png" } = req.body;


    if (image === undefined || image === "") {
        image = "/default.png";
    }

    if (protein !== undefined || protein !== "" && typeof protein === "string") {
        protein = replaceCommaWithDot(protein);
    }

    if (calories !== undefined || calories !== "" && typeof protein === "string") {
        calories = replaceCommaWithDot(calories);
    }

    if (grease !== undefined || grease !== "" && typeof protein === "string") {
        grease = replaceCommaWithDot(grease);
    }

    if (salt !== undefined || salt !== "" && typeof protein === "string") {
        salt = replaceCommaWithDot(salt);
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

        const newFood = await prisma.food.create({
            data: {
                name,
                portion: parseInt(portion),
                protein: parseFloat(protein),
                calories: parseFloat(calories),
                grease: parseFloat(grease),
                salt: parseFloat(salt),
                image,
                users_has_foods: {
                    create: {
                        users: {
                            connect: {
                                id: decodedToken.id
                            }
                        }
                    }
                }
            },
        });

        res.status(200).json({ msg: "Food created with success:", food: newFood });
        return

    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const updateFoodByUserId = async (req: Request, res: Response) => {

    const foodId = parseInt(req.params.id); // ID do alimento a ser atualizado
    let { portion, protein, calories, grease, salt, image = "/default.png" } = req.body;


    if (!portion && !protein && !calories && !grease && !salt) {
        res.status(400).json({ msg: "Unable to update, please enter a field to be updated." });
        return;
    }

    // Recuperando o token do cabeçalho de autorização
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
                users_has_foods: {
                    where: { foods_id: foodId }
                }
            }
        });

        if (!user || user.users_has_foods.length === 0) {
            res.status(404).json({ error: "Food not found or doesn't belong to the user." });
            return;
        }

        //atualizar o food ID indicando nos parametros do usuario que está logado.

        // Obtenha os detalhes do alimento a ser atualizado
        const food = await prisma.food.findUnique({
            where: { id: foodId }
        });

        if (!food) {
            res.status(404).json({ error: "Food not found." });
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


            if (portion) updatedFood.portion = parseInt(portion);

            if (protein) {
                protein = replaceCommaWithDot(protein);
                updatedFood.protein = parseFloat(protein);
            }

            if (calories) {
                calories = replaceCommaWithDot(calories);
                updatedFood.calories = parseFloat(calories);
            }

            if (grease) {
                grease = replaceCommaWithDot(grease);
                updatedFood.grease = parseFloat(grease);
            }

            if (salt) {
                salt = replaceCommaWithDot(salt);
                updatedFood.salt = parseFloat(salt);
            }

            if (image) updatedFood.image = image;

            let savedFood = await prisma.food.update({
                where: {
                    id: foodId
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

            })
            res.status(200).json({ msg: "Food updated with success:", food: savedFood });
            return

        }

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const deleteOneFoodByUserId = async (req: Request, res: Response) => {

    const foodId = parseInt(req.params.id); // ID do alimento a ser atualizado 

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
                users_has_foods: {
                    where: { foods_id: foodId }
                }
            }
        });

        if (!user || user.users_has_foods.length === 0) {
            res.status(404).json({ error: "Food not found or doesn't belong to the user." });
            return;
        }

        // Exclua o alimento
        await prisma.food.delete({
            where: { id: foodId }
        });

        return res.status(200).json({ msg: "Food removed with success" });


    } catch (error) {
        console.error("Error fetching user's foods:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}




//ATUALIZAR O FOOD, O FOOD SO PODE SER ATUALIZADO CASO ESSE FOOD COM ESSE DETERMINADO ID SEJA ATRELADO AO USUARIO QUE O CRIOU.



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