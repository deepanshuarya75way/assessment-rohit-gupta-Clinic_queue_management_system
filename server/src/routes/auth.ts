import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login as any);
router.post('/register', authenticate as any, authorize('admin') as any, authController.register as any);
router.get('/profile', authenticate as any, authController.getProfile as any);

export default router;
