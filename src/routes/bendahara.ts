import { Router } from 'express';
import * as ctrl from '../controllers/bendaharaController';
import authenticate from '../middleware/auth';

const router = Router();
router.get('/', authenticate, ctrl.getInfo);
export default router;
