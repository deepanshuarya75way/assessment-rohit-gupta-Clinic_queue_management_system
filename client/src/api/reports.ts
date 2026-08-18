import api from './client';

export const getFootfall = (startDate: string, endDate: string) =>
  api.get('/reports/footfall', { params: { startDate, endDate } }).then((r) => r.data);

export const getWaitTimes = (startDate: string, endDate: string) =>
  api.get('/reports/wait-times', { params: { startDate, endDate } }).then((r) => r.data);

export const getDoctorStats = (doctorId: number, startDate: string, endDate: string) =>
  api.get('/reports/doctor-stats', { params: { doctorId, startDate, endDate } }).then((r) => r.data);
