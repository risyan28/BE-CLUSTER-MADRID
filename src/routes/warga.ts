import { Router } from 'express';
import * as ctrl from '../controllers/wargaController';
import authenticate from '../middleware/auth';
import rbac from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, rbac('admin'), ctrl.create);
router.put('/:id', authenticate, rbac('admin'), ctrl.update);
router.put('/:id/role', authenticate, rbac('admin'), ctrl.toggleRole);
router.delete('/:id', authenticate, rbac('admin'), ctrl.delete_);

export default router;
