import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as patientController from '../controllers/patientController';

const router = Router();

router.use(authenticate as any);
router.get('/', patientController.list as any);
router.get('/phone/:phone', patientController.getByPhone as any);
router.get('/:id', patientController.getById as any);
router.post('/', authorize('admin', 'receptionist') as any, patientController.create as any);
router.put('/:id', authorize('admin', 'receptionist') as any, patientController.update as any);

export default router;
