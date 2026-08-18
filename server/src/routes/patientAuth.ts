import { Router } from 'express';
import { authenticatePatient } from '../middleware/patientAuth';
import * as patientAuthController from '../controllers/patientAuthController';

const router = Router();

router.post('/register', patientAuthController.patientRegister as any);
router.post('/login', patientAuthController.patientLogin as any);
router.get('/appointments', authenticatePatient as any, patientAuthController.patientAppointments as any);
router.get('/queue-status', authenticatePatient as any, patientAuthController.patientQueueStatus as any);
router.post('/book-appointment', authenticatePatient as any, patientAuthController.patientBookAppointment as any);

export default router;
