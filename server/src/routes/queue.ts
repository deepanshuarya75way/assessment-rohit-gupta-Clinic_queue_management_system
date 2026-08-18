import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as queueController from '../controllers/queueController';

const router = Router();

router.get('/doctor/:doctorId', queueController.getQueue as any);
router.get('/doctor/:doctorId/current', queueController.getCurrentAndNext as any);

router.use(authenticate as any);
router.post('/', authorize('admin', 'receptionist') as any, queueController.addToQueue as any);
router.patch('/:doctorId/call', authorize('doctor') as any, queueController.callNext as any);
router.patch('/:id/skip', authorize('doctor', 'receptionist') as any, queueController.skipPatient as any);
router.patch('/:id/complete', authorize('doctor') as any, queueController.completePatient as any);

export default router;
