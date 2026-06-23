import { Router } from 'express';
import * as ctrl from '../controllers/tagihanController';
import authenticate from '../middleware/auth';

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/saya', authenticate, ctrl.getTagihanSaya);
router.get('/:id', authenticate, ctrl.getById);

export default router;
