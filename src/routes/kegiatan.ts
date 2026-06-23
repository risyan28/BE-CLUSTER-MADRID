import { Router } from 'express';
import * as ctrl from '../controllers/kegiatanController';
import authenticate from '../middleware/auth';
import rbac from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, rbac('admin'), ctrl.create);
router.put('/:id', authenticate, rbac('admin'), ctrl.update);
router.delete('/:id', authenticate, rbac('admin'), ctrl.delete_);
router.post('/:id/hadir', authenticate, ctrl.hadir);

export default router;
