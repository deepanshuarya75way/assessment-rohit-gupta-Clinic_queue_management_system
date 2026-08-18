import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Appointment } from '../entities/Appointment';
import { Queue } from '../entities/Queue';
import { AuthRequest } from '../types';
import * as queueEngine from '../services/queueEngine';
import { emitQueueUpdate } from '../socket';

const repo = () => AppDataSource.getRepository(Appointment);

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const { date, doctorId, status } = req.query;
  const where: any = {};

  if (date) where.appointmentDate = date;
  if (doctorId) where.doctorId = parseInt(doctorId as string);
  if (status) where.status = status;

  const appointments = await repo().find({
    where,
    order: { appointmentTime: 'ASC' },
    relations: ['patient', 'doctor'],
  });
  res.json(appointments);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { patientId, doctorId, appointmentDate, appointmentTime, notes } = req.body;
  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const appointment = repo().create({
    patientId, doctorId, appointmentDate, appointmentTime, notes,
    status: 'booked',
  });
  await repo().save(appointment);

  const full = await repo().findOne({ where: { id: appointment.id }, relations: ['patient', 'doctor'] });
  res.status(201).json(full);
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const appointment = await repo().findOne({ where: { id }, relations: ['patient', 'doctor'] });
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  const oldStatus = appointment.status;
  appointment.status = status;
  await repo().save(appointment);

  if (oldStatus === 'booked' && status === 'checked-in') {
    try {
      const queueEntry = await queueEngine.addToQueue(
        appointment.patientId,
        appointment.doctorId,
        false
      );
      emitQueueUpdate(appointment.doctorId);
      res.json({ appointment, queueEntry });
      return;
    } catch (err) {
      console.error('[Appointment] Auto-queue creation failed:', err);
    }
  }

  res.json(appointment);
}
