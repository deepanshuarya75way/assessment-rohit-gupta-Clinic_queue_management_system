import { AppDataSource } from '../config/database';
import { Queue } from '../entities/Queue';
import { Between } from 'typeorm';

const queueRepo = () => AppDataSource.getRepository(Queue);

export async function getFootfall(startDate: string, endDate: string): Promise<any> {
  return queueRepo()
    .createQueryBuilder('q')
    .select("q.queueDate as date, COUNT(q.id) as count")
    .where('q.queueDate BETWEEN :start AND :end', { start: startDate, end: endDate })
    .groupBy('q.queueDate')
    .orderBy('q.queueDate', 'ASC')
    .getRawMany();
}

export async function getWaitTimes(startDate: string, endDate: string): Promise<any> {
  const data = await queueRepo()
    .createQueryBuilder('q')
    .select([
      'AVG(EXTRACT(EPOCH FROM (q.calledAt - q.createdAt))/60) as avgWaitMinutes',
      'COUNT(q.id) as totalCalled',
    ])
    .where('q.queueDate BETWEEN :start AND :end', { start: startDate, end: endDate })
    .andWhere('q.calledAt IS NOT NULL')
    .getRawOne();
  return data;
}

export async function getDoctorStats(doctorId: number, startDate: string, endDate: string): Promise<any> {
  const totalPatients = await queueRepo().count({
    where: {
      doctorId,
      queueDate: Between(startDate, endDate),
    },
  });

  const completed = await queueRepo().count({
    where: {
      doctorId,
      queueDate: Between(startDate, endDate),
      status: 'completed',
    },
  });

  const noShows = await queueRepo().count({
    where: {
      doctorId,
      queueDate: Between(startDate, endDate),
      status: 'skipped',
    },
  });

  return {
    totalPatients,
    completed,
    noShows,
    completionRate: totalPatients > 0 ? Math.round((completed / totalPatients) * 100) : 0,
  };
}
