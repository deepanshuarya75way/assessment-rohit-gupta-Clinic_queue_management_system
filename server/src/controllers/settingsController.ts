import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { ClinicSettings } from '../entities/ClinicSettings';
import { AuthRequest } from '../types';

const repo = () => AppDataSource.getRepository(ClinicSettings);

export async function getSettings(req: AuthRequest, res: Response): Promise<void> {
  let settings = await repo().findOneBy({ id: 1 });
  if (!settings) {
    settings = repo().create({ id: 1, clinicName: 'My Clinic' });
    await repo().save(settings);
  }
  res.json(settings);
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  let settings = await repo().findOneBy({ id: 1 });
  if (!settings) {
    settings = repo().create({ id: 1, clinicName: 'My Clinic' });
  }

  const { clinicName, address, phone, workingHours, holidays, defaultConsultationMinutes } = req.body;
  if (clinicName) settings.clinicName = clinicName;
  if (address) settings.address = address;
  if (phone) settings.phone = phone;
  if (workingHours) settings.workingHours = workingHours;
  if (holidays) settings.holidays = holidays;
  if (defaultConsultationMinutes) settings.defaultConsultationMinutes = defaultConsultationMinutes;

  await repo().save(settings);
  res.json(settings);
}
