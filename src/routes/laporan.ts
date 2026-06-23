import { Router } from 'express';
import * as ctrl from '../controllers/laporanController';
import authenticate from '../middleware/auth';

const router = Router();

router.get('/iuran', authenticate, ctrl.laporanIuran);
router.get('/kas', authenticate, ctrl.laporanKas);
router.get('/warga', authenticate, ctrl.laporanWarga);

export default router;
