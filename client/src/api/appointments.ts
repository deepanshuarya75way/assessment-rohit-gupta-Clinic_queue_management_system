import api from './client';
import { Appointment } from '../types';

export const listAppointments = (params?: { date?: string; doctorId?: number; status?: string }) =>
  api.get<Appointment[]>('/appointments', { params }).then((r) => r.data);

export const createAppointment = (data: {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}) => api.post<Appointment>('/appointments', data).then((r) => r.data);

export const updateAppointmentStatus = (id: number, status: string) =>
  api.patch<Appointment>(`/appointments/${id}`, { status }).then((r) => r.data);
