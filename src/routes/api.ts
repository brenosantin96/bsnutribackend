import { Router } from 'express';

import * as UserController from '../controllers/UserController';
import * as LoginAndRegisterController from '../controllers/LoginAndRegisterController';
import { Auth } from '../middlewares/Auth';

const router = Router();

router.get('/api/ping', UserController.ping);
router.get('/api/users', Auth.private, UserController.getUsers);


router.post('/api/register', LoginAndRegisterController.signUp);
router.post('/api/login', LoginAndRegisterController.login);
router.post('/api/logout', LoginAndRegisterController.logout);

//validate
router.post('api/validate', Auth.private);


export default router;