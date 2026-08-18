import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as doctorController from '../controllers/doctorController';

const router = Router();

router.get('/', doctorController.list as any);
router.get('/:id', doctorController.getById as any);

router.use(authenticate as any);
router.post('/', authorize('admin') as any, doctorController.create as any);
router.put('/:id', authorize('admin') as any, doctorController.update as any);

export default router;
