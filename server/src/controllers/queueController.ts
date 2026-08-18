import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Queue } from '../entities/Queue';
import { Appointment } from '../entities/Appointment';
import { AuthRequest } from '../types';
import * as queueEngine from '../services/queueEngine';
import { emitQueueUpdate } from '../socket';
import { getTodayString } from '../utils/helpers';

export async function getQueue(req: AuthRequest, res: Response): Promise<void> {
  const doctorId = parseInt(req.params.doctorId);
  if (isNaN(doctorId)) { res.status(400).json({ error: 'Invalid doctorId' }); return; }
  const { date } = req.query;
  const queue = await queueEngine.getQueueForDoctor(doctorId, date as string);
  res.json(queue);
}

export async function getCurrentAndNext(req: AuthRequest, res: Response): Promise<void> {
  const doctorId = parseInt(req.params.doctorId);
  if (isNaN(doctorId)) { res.status(400).json({ error: 'Invalid doctorId' }); return; }
  const result = await queueEngine.getCurrentAndNext(doctorId);
  res.json(result);
}

export async function addToQueue(req: AuthRequest, res: Response): Promise<void> {
  const { patientId, doctorId, isWalkIn } = req.body;
  if (!patientId || !doctorId) {
    res.status(400).json({ error: 'Patient ID and Doctor ID required' });
    return;
  }

  try {
    const entry = await queueEngine.addToQueue(patientId, doctorId, isWalkIn !== false);
    const fullEntry = await AppDataSource.getRepository(Queue).findOne({
      where: { id: entry.id },
      relations: ['patient'],
    });
    emitQueueUpdate(doctorId);
    res.status(201).json(fullEntry);
  } catch (err) {
    console.error('[Queue] addToQueue error:', err);
    res.status(500).json({ error: 'Failed to add to queue' });
  }
}

export async function callNext(req: AuthRequest, res: Response): Promise<void> {
  const doctorId = parseInt(req.params.doctorId);
  if (isNaN(doctorId)) { res.status(400).json({ error: 'Invalid doctorId' }); return; }

  try {
    const entry = await queueEngine.callNextPatient(doctorId);
    if (!entry) {
      res.status(404).json({ error: 'No waiting patients' });
      return;
    }
    emitQueueUpdate(doctorId);
    res.json(entry);
  } catch (err) {
    console.error('[Queue] callNext error:', err);
    res.status(500).json({ error: 'Failed to call next patient' });
  }
}

export async function skipPatient(req: AuthRequest, res: Response): Promise<void> {
  const queueId = parseInt(req.params.id);
  if (isNaN(queueId)) { res.status(400).json({ error: 'Invalid queue ID' }); return; }

  try {
    const entry = await queueEngine.skipPatient(queueId);
    if (!entry) {
      res.status(404).json({ error: 'Queue entry not found' });
      return;
    }
    emitQueueUpdate(entry.doctorId);
    res.json(entry);
  } catch (err) {
    console.error('[Queue] skip error:', err);
    res.status(500).json({ error: 'Failed to skip patient' });
  }
}

export async function completePatient(req: AuthRequest, res: Response): Promise<void> {
  const queueId = parseInt(req.params.id);
  if (isNaN(queueId)) { res.status(400).json({ error: 'Invalid queue ID' }); return; }

  try {
    const entry = await queueEngine.completePatient(queueId);
    if (!entry) {
      res.status(404).json({ error: 'Queue entry not found' });
      return;
    }

    const today = getTodayString();
    const appointment = await AppDataSource.getRepository(Appointment).findOne({
      where: {
        patientId: entry.patientId,
        doctorId: entry.doctorId,
        appointmentDate: today,
        status: 'checked-in',
      },
    });
    if (appointment) {
      appointment.status = 'completed';
      await AppDataSource.getRepository(Appointment).save(appointment);
    }

    emitQueueUpdate(entry.doctorId);
    res.json(entry);
  } catch (err) {
    console.error('[Queue] complete error:', err);
    res.status(500).json({ error: 'Failed to complete consultation' });
  }
}
