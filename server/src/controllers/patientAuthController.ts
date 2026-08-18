import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LessThan } from 'typeorm';
import { AppDataSource } from '../config/database';
import { env } from '../config/env';
import { Patient } from '../entities/Patient';
import { AuthRequest } from '../types';
import { Appointment } from '../entities/Appointment';
import { Queue } from '../entities/Queue';

const patientRepo = () => AppDataSource.getRepository(Patient);
const appointmentRepo = () => AppDataSource.getRepository(Appointment);
const queueRepo = () => AppDataSource.getRepository(Queue);

export async function patientRegister(req: AuthRequest, res: Response): Promise<void> {
  const { fullName, phoneNumber, password, age, gender } = req.body;
  if (!fullName || !phoneNumber || !password) {
    res.status(400).json({ error: 'Full name, phone, and password required' });
    return;
  }

  let patient = await patientRepo().findOneBy({ phoneNumber });
  if (patient) {
    if (patient.passwordHash) {
      res.status(409).json({ error: 'Phone already registered. Please login.' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    patient.passwordHash = passwordHash;
    if (age) patient.age = age;
    if (gender) patient.gender = gender;
    await patientRepo().save(patient);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    patient = patientRepo().create({ fullName, phoneNumber, passwordHash, age, gender });
    await patientRepo().save(patient);
  }

  const token = jwt.sign(
    { patientId: patient.id, phone: patient.phoneNumber },
    env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    token,
    patient: {
      id: patient.id, fullName: patient.fullName, phoneNumber: patient.phoneNumber,
      age: patient.age, gender: patient.gender,
    },
  });
}

export async function patientLogin(req: AuthRequest, res: Response): Promise<void> {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    res.status(400).json({ error: 'Phone and password required' });
    return;
  }

  const patient = await patientRepo().findOneBy({ phoneNumber });
  if (!patient || !patient.passwordHash) {
    res.status(401).json({ error: 'Invalid credentials or account not registered' });
    return;
  }

  if (!(await bcrypt.compare(password, patient.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { patientId: patient.id, phone: patient.phoneNumber },
    env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    patient: {
      id: patient.id, fullName: patient.fullName, phoneNumber: patient.phoneNumber,
      age: patient.age, gender: patient.gender,
    },
  });
}

export async function patientAppointments(req: AuthRequest, res: Response): Promise<void> {
  const patientId = (req as any).patientId;
  if (!patientId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const appointments = await appointmentRepo().find({
    where: { patientId },
    order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    relations: ['doctor'],
    take: 20,
  });

  res.json(appointments);
}

export async function patientQueueStatus(req: AuthRequest, res: Response): Promise<void> {
  const patientId = (req as any).patientId;
  if (!patientId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const queueEntry = await queueRepo().findOne({
    where: { patientId, queueDate: today },
    order: { createdAt: 'DESC' },
    relations: ['doctor', 'patient'],
  });

  if (!queueEntry) {
    res.json({ active: false, message: 'No active queue entry today' });
    return;
  }

  let waitingAhead = 0;
  if (queueEntry.status === 'waiting') {
    waitingAhead = await queueRepo().count({
      where: {
        doctorId: queueEntry.doctorId,
        queueDate: today,
        status: 'waiting',
        sequenceNumber: LessThan(queueEntry.sequenceNumber),
      },
    });
  }

  const doctorName = (queueEntry.doctor as any)?.fullName || null;

  res.json({
    active: queueEntry.status === 'waiting' || queueEntry.status === 'in-progress',
    token: queueEntry.tokenNumber,
    status: queueEntry.status,
    doctorName,
    estimatedWaitMinutes: queueEntry.estimatedWaitMinutes,
    position: waitingAhead,
  });
}

export async function patientBookAppointment(req: AuthRequest, res: Response): Promise<void> {
  const patientId = (req as any).patientId;
  if (!patientId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { doctorId, appointmentDate, appointmentTime, notes } = req.body;
  if (!doctorId || !appointmentDate || !appointmentTime) {
    res.status(400).json({ error: 'Doctor, date, and time required' });
    return;
  }

  if (appointmentDate < new Date().toISOString().split('T')[0]) {
    res.status(400).json({ error: 'Cannot book in the past' });
    return;
  }

  const existingCount = await appointmentRepo().count({
    where: { doctorId, appointmentDate, appointmentTime, status: 'booked' },
  });

  if (existingCount > 0) {
    res.status(409).json({ error: 'Time slot already booked' });
    return;
  }

  const appointment = appointmentRepo().create({
    patientId, doctorId, appointmentDate, appointmentTime, notes,
    status: 'booked',
  });
  await appointmentRepo().save(appointment);

  const full = await appointmentRepo().findOne({
    where: { id: appointment.id },
    relations: ['doctor', 'patient'],
  });

  res.status(201).json(full);
}
