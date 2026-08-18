import { AppDataSource } from '../config/database';
import { Queue } from '../entities/Queue';
import { Doctor } from '../entities/Doctor';
import { ClinicSettings } from '../entities/ClinicSettings';
import { generateTokenNumber, getNextSequence, getTodayString } from '../utils/helpers';

const queueRepo = () => AppDataSource.getRepository(Queue);
const doctorRepo = () => AppDataSource.getRepository(Doctor);
const settingsRepo = () => AppDataSource.getRepository(ClinicSettings);

export async function addToQueue(patientId: number, doctorId: number, isWalkIn: boolean = true): Promise<Queue> {
  const today = getTodayString();
  const sequence = await getNextSequence(settingsRepo(), today);
  const tokenNumber = generateTokenNumber(doctorId, sequence);

  const doctor = await doctorRepo().findOneBy({ id: doctorId });
  const avgMinutes = doctor?.avgConsultationMinutes || 10;

  const waitingCount = await queueRepo().count({
    where: { doctorId, queueDate: today, status: 'waiting' },
  });

  const entry = queueRepo().create({
    tokenNumber,
    patientId,
    doctorId,
    queueDate: today,
    sequenceNumber: sequence,
    status: 'waiting',
    isWalkIn,
    estimatedWaitMinutes: waitingCount * avgMinutes,
  });

  return queueRepo().save(entry);
}

export async function callNextPatient(doctorId: number): Promise<Queue | null> {
  const today = getTodayString();

  const nextPatient = await queueRepo().findOne({
    where: { doctorId, queueDate: today, status: 'waiting' },
    order: { sequenceNumber: 'ASC' },
    relations: ['patient'],
  });

  if (!nextPatient) return null;

  nextPatient.status = 'in-progress';
  nextPatient.calledAt = new Date();
  return queueRepo().save(nextPatient);
}

export async function skipPatient(queueId: number): Promise<Queue | null> {
  const entry = await queueRepo().findOneBy({ id: queueId });
  if (!entry) return null;
  entry.status = 'skipped';
  return queueRepo().save(entry);
}

export async function completePatient(queueId: number): Promise<Queue | null> {
  const entry = await queueRepo().findOneBy({ id: queueId });
  if (!entry) return null;
  entry.status = 'completed';
  entry.completedAt = new Date();
  return queueRepo().save(entry);
}

export async function getQueueForDoctor(doctorId: number, date?: string): Promise<Queue[]> {
  const today = date || getTodayString();
  return queueRepo().find({
    where: { doctorId, queueDate: today },
    order: { sequenceNumber: 'ASC' },
    relations: ['patient'],
  });
}

export async function getCurrentAndNext(doctorId: number): Promise<{ current: Queue | null; next: Queue[] }> {
  const today = getTodayString();
  const all = await queueRepo().find({
    where: { doctorId, queueDate: today },
    order: { sequenceNumber: 'ASC' },
    relations: ['patient'],
  });

  const current = all.find((q) => q.status === 'in-progress') || null;
  const next = all.filter((q) => q.status === 'waiting').slice(0, 5);
  return { current, next };
}
