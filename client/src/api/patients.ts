import api from './client';
import { Patient } from '../types';

export const listPatients = (search?: string) =>
  api.get<Patient[]>('/patients', { params: { search } }).then((r) => r.data);

export const getPatient = (id: number) =>
  api.get<Patient>(`/patients/${id}`).then((r) => r.data);

export const getPatientByPhone = (phone: string) =>
  api.get<Patient>(`/patients/phone/${phone}`).then((r) => r.data);

export const createPatient = (data: Partial<Patient>) =>
  api.post<Patient>('/patients', data).then((r) => r.data);

export const updatePatient = (id: number, data: Partial<Patient>) =>
  api.put<Patient>(`/patients/${id}`, data).then((r) => r.data);
