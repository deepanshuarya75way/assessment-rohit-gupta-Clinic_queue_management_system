import api from './client';
import { Doctor } from '../types';

export const listDoctors = () =>
  api.get<Doctor[]>('/doctors').then((r) => r.data);

export const getDoctor = (id: number) =>
  api.get<Doctor>(`/doctors/${id}`).then((r) => r.data);

export const createDoctor = (data: Partial<Doctor>) =>
  api.post<Doctor>('/doctors', data).then((r) => r.data);

export const updateDoctor = (id: number, data: Partial<Doctor>) =>
  api.put<Doctor>(`/doctors/${id}`, data).then((r) => r.data);
