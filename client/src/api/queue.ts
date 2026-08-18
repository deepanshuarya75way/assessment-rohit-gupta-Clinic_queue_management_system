import api from './client';
import { QueueEntry } from '../types';

export const getQueue = (doctorId: number, date?: string) =>
  api.get<QueueEntry[]>(`/queue/doctor/${doctorId}`, { params: { date } }).then((r) => r.data);

export const getCurrentAndNext = (doctorId: number) =>
  api.get<{ current: QueueEntry | null; next: QueueEntry[] }>(`/queue/doctor/${doctorId}/current`).then((r) => r.data);

export const addToQueue = (patientId: number, doctorId: number, isWalkIn?: boolean) =>
  api.post<QueueEntry>('/queue', { patientId, doctorId, isWalkIn }).then((r) => r.data);

export const callNext = (doctorId: number) =>
  api.patch<QueueEntry>(`/queue/${doctorId}/call`, {}).then((r) => r.data);

export const skipPatient = (id: number) =>
  api.patch<QueueEntry>(`/queue/${id}/skip`, {}).then((r) => r.data);

export const completePatient = (id: number) =>
  api.patch<QueueEntry>(`/queue/${id}/complete`, {}).then((r) => r.data);
