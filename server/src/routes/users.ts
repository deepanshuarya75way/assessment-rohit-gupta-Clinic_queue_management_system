import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

router.use(authenticate as any);
router.use(authorize('admin') as any);
router.get('/', userController.list as any);
router.post('/', userController.create as any);
router.patch('/:id/toggle-active', userController.toggleActive as any);

export default router;
