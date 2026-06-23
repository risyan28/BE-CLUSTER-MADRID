import { Router } from 'express';
import * as ctrl from '../controllers/kasController';
import authenticate from '../middleware/auth';
import rbac from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/saldo', authenticate, ctrl.saldo);
router.post('/', authenticate, rbac('admin'), ctrl.create);

export default router;
