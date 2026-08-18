import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Visit } from '../entities/Visit';
import { AuthRequest } from '../types';

const repo = () => AppDataSource.getRepository(Visit);

export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  const patientId = parseInt(req.params.patientId);
  const visits = await repo().find({
    where: { patientId },
    order: { visitDate: 'DESC' },
    take: 20,
    relations: ['doctor'],
  });
  res.json(visits);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { patientId, doctorId, diagnosis, prescription, notes, reasonForVisit } = req.body;
  if (!patientId || !doctorId) {
    res.status(400).json({ error: 'Patient ID and Doctor ID required' });
    return;
  }

  const visit = repo().create({
    patientId,
    doctorId,
    visitDate: new Date().toISOString().split('T')[0],
    diagnosis,
    prescription,
    notes,
    reasonForVisit,
  });
  await repo().save(visit);

  const full = await repo().findOne({ where: { id: visit.id }, relations: ['doctor'] });
  res.status(201).json(full);
}
