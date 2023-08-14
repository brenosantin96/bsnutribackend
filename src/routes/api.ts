import { Router } from 'express';

import * as UserController from '../controllers/UserController';
import * as LoginAndRegisterController from '../controllers/LoginAndRegisterController';
import * as FoodController from '../controllers/FoodController';
import * as MealController from '../controllers/MealController';

import { Auth } from '../middlewares/Auth';

const router = Router();

router.get('/api/ping', UserController.ping);
router.get('/api/users', Auth.private, UserController.getUsers);


router.post('/api/register', LoginAndRegisterController.signUp);
router.post('/api/login', LoginAndRegisterController.login);
router.post('/api/logout', LoginAndRegisterController.logout);

//validate
router.post('api/validate', Auth.private);

//foods
router.get('/api/foods', FoodController.getFoods);
router.get('/api/foods/:id', FoodController.getOneFood);
router.post('/api/foods', FoodController.createFood);
router.put('/api/foods/:id', FoodController.updateFood);
router.delete('/api/foods/:id', FoodController.deleteOneFood);

//foodsByUsers
router.get('/api/foodsByUser', Auth.private, FoodController.getFoodsByUserId); //ok
router.get('/api/foodsByUser/:id', Auth.private, FoodController.getOneFoodByUserId); //ok
router.post('/api/foodsByUser', Auth.private, FoodController.createFoodsByUserId); //ok
router.put('/api/foodsByUser/:id', Auth.private, FoodController.updateFoodByUserId); //ok
router.delete('/api/foodsByUser/:id', Auth.private, FoodController.deleteOneFoodByUserId); //ok

//mealsByUser
router.get('/api/mealsByUser', Auth.private, MealController.getMealsByUserId); //ok
router.post('/api/mealsByUser', Auth.private, MealController.createMealByUserId); //ok




export default router;