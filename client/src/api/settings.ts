import api from './client';
import { ClinicSettings } from '../types';

export const getSettings = () =>
  api.get<ClinicSettings>('/settings').then((r) => r.data);

export const updateSettings = (data: Partial<ClinicSettings>) =>
  api.put<ClinicSettings>('/settings', data).then((r) => r.data);
