import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as settingsController from '../controllers/settingsController';

const router = Router();

router.use(authenticate as any);
router.get('/', settingsController.getSettings as any);
router.put('/', authorize('admin') as any, settingsController.updateSettings as any);

export default router;
