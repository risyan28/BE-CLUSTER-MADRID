import { Router } from 'express';
import * as auth from '../controllers/authController';
import authenticate from '../middleware/auth';

const router = Router();

router.post('/login-hunian', auth.loginByHunian);
router.post('/register', authenticate, auth.register);
router.get('/me', authenticate, auth.me);
router.get('/hunian-list', auth.getHunianList);

export default router;
