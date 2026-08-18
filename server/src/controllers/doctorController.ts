import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Doctor } from '../entities/Doctor';
import { AuthRequest } from '../types';

const repo = () => AppDataSource.getRepository(Doctor);

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const doctors = await repo().find({ order: { fullName: 'ASC' } });
  res.json(doctors);
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const doctor = await repo().findOneBy({ id: parseInt(req.params.id) });
  if (!doctor) {
    res.status(404).json({ error: 'Doctor not found' });
    return;
  }
  res.json(doctor);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { fullName, specialization, workingHours, departmentId, avgConsultationMinutes } = req.body;
  if (!fullName) {
    res.status(400).json({ error: 'Doctor name required' });
    return;
  }

  const doctor = repo().create({
    fullName,
    specialization,
    workingHours,
    departmentId,
    avgConsultationMinutes: avgConsultationMinutes || 10,
  });
  await repo().save(doctor);
  res.status(201).json(doctor);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const doctor = await repo().findOneBy({ id: parseInt(req.params.id) });
  if (!doctor) {
    res.status(404).json({ error: 'Doctor not found' });
    return;
  }

  const { fullName, specialization, workingHours, status, departmentId, avgConsultationMinutes } = req.body;
  if (fullName) doctor.fullName = fullName;
  if (specialization) doctor.specialization = specialization;
  if (workingHours) doctor.workingHours = workingHours;
  if (status) doctor.status = status;
  if (departmentId) doctor.departmentId = departmentId;
  if (avgConsultationMinutes) doctor.avgConsultationMinutes = avgConsultationMinutes;

  await repo().save(doctor);
  res.json(doctor);
}
