import { Router } from 'express';
import * as ctrl from '../controllers/qrisController';
import authenticate from '../middleware/auth';
import rbac from '../middleware/rbac';
import upload from '../middleware/upload';

const router = Router();

router.get('/', authenticate, ctrl.getQris);
router.post('/upload', authenticate, rbac('admin'), upload.single('qris'), ctrl.uploadQris);
router.delete('/', authenticate, rbac('admin'), ctrl.deleteQris);

export default router;
