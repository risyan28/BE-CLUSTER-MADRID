import { Router } from 'express';
import * as ctrl from '../controllers/pembayaranController';
import authenticate from '../middleware/auth';
import rbac from '../middleware/rbac';
import upload from '../middleware/upload';

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.post('/', authenticate, rbac('admin'), ctrl.create);
router.post('/upload-bukti', authenticate, upload.single('bukti'), ctrl.uploadBukti);
router.put('/:id/verifikasi', authenticate, rbac('admin'), ctrl.verifikasi);
router.put('/:id/tolak', authenticate, rbac('admin'), ctrl.tolak);

export default router;
