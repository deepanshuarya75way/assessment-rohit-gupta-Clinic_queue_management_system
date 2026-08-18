import { Response } from 'express';
import { AuthRequest } from '../types';
import * as reportService from '../services/reportService';

export async function getFootfall(req: AuthRequest, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ error: 'startDate and endDate required' });
    return;
  }
  const data = await reportService.getFootfall(startDate as string, endDate as string);
  res.json(data);
}

export async function getWaitTimes(req: AuthRequest, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ error: 'startDate and endDate required' });
    return;
  }
  const data = await reportService.getWaitTimes(startDate as string, endDate as string);
  res.json(data);
}

export async function getDoctorStats(req: AuthRequest, res: Response): Promise<void> {
  const { doctorId, startDate, endDate } = req.query;
  if (!doctorId || !startDate || !endDate) {
    res.status(400).json({ error: 'doctorId, startDate, endDate required' });
    return;
  }
  const data = await reportService.getDoctorStats(
    parseInt(doctorId as string),
    startDate as string,
    endDate as string
  );
  res.json(data);
}
