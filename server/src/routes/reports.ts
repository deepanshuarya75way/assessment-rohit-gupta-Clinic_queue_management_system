import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as reportController from '../controllers/reportController';

const router = Router();

router.use(authenticate as any);
router.use(authorize('admin') as any);
router.get('/footfall', reportController.getFootfall as any);
router.get('/wait-times', reportController.getWaitTimes as any);
router.get('/doctor-stats', reportController.getDoctorStats as any);

export default router;
