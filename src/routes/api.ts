import { Router } from 'express';

import * as UserController from '../controllers/UserController';
import * as LoginAndRegisterController from '../controllers/LoginAndRegisterController';
import { Auth } from '../middlewares/Auth';

const router = Router();

router.get('/ping', UserController.ping);
router.get('/users', UserController.getUsers);


router.post('/users', UserController.createUser);


export default router;