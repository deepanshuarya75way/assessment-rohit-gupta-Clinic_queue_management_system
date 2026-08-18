import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as appointmentController from '../controllers/appointmentController';

const router = Router();

router.use(authenticate as any);
router.get('/', appointmentController.list as any);
router.post('/', authorize('admin', 'receptionist') as any, appointmentController.create as any);
router.patch('/:id', authorize('admin', 'receptionist') as any, appointmentController.updateStatus as any);

export default router;
