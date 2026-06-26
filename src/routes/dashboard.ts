import { Router } from 'express';
import * as ctrl from '../controllers/dashboardController';
import authenticate from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, ctrl.stats);
router.get('/grafik-iuran', authenticate, ctrl.grafikIuran);
router.get('/grafik-kas', authenticate, ctrl.grafikKas);
router.get('/matriks-iuran', authenticate, ctrl.matriksIuran);

export default router;
