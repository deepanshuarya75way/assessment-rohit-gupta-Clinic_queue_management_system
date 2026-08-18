import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as visitController from '../controllers/visitController';

const router = Router();

router.use(authenticate as any);
router.get('/patient/:patientId', visitController.getHistory as any);
router.post('/', authorize('doctor') as any, visitController.create as any);

export default router;
