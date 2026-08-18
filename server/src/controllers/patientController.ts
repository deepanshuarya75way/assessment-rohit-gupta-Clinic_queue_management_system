import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../entities/Patient';
import { AuthRequest } from '../types';

const repo = () => AppDataSource.getRepository(Patient);

function stripPassword(patient: Patient): any {
  return {
    id: patient.id,
    fullName: patient.fullName,
    phoneNumber: patient.phoneNumber,
    age: patient.age,
    gender: patient.gender,
    address: patient.address,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const { search, limit } = req.query;
  let qb = repo().createQueryBuilder('p').orderBy('p.createdAt', 'DESC');

  if (search) {
    qb.where('p.fullName ILIKE :search OR p.phoneNumber ILIKE :search', {
      search: `%${search}%`,
    });
  }

  if (limit) qb.take(parseInt(limit as string, 10));
  else qb.take(50);

  const patients = await qb.getMany();
  res.json(patients.map(stripPassword));
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const patient = await repo().findOneBy({ id: parseInt(req.params.id) });
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }
  res.json(stripPassword(patient));
}

export async function getByPhone(req: AuthRequest, res: Response): Promise<void> {
  const patient = await repo().findOneBy({ phoneNumber: req.params.phone });
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }
  res.json(stripPassword(patient));
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { fullName, phoneNumber, age, gender, address } = req.body;
  if (!fullName || !phoneNumber) {
    res.status(400).json({ error: 'Full name and phone number required' });
    return;
  }

  const existing = await repo().findOneBy({ phoneNumber });
  if (existing) {
    res.status(409).json({ error: 'Patient with this phone already exists', patient: stripPassword(existing) });
    return;
  }

  const patient = repo().create({ fullName, phoneNumber, age, gender, address });
  await repo().save(patient);
  res.status(201).json(stripPassword(patient));
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const patient = await repo().findOneBy({ id: parseInt(req.params.id) });
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  const { fullName, phoneNumber, age, gender, address } = req.body;
  if (fullName) patient.fullName = fullName;
  if (phoneNumber) patient.phoneNumber = phoneNumber;
  if (age !== undefined) patient.age = age;
  if (gender) patient.gender = gender;
  if (address) patient.address = address;

  await repo().save(patient);
  res.json(stripPassword(patient));
}
