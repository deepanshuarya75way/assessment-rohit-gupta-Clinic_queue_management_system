import api from './client';
import { Visit } from '../types';

export const getVisitHistory = (patientId: number) =>
  api.get<Visit[]>(`/visits/patient/${patientId}`).then((r) => r.data);

export const createVisit = (data: {
  patientId: number;
  doctorId: number;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  reasonForVisit?: string;
}) => api.post<Visit>('/visits', data).then((r) => r.data);
