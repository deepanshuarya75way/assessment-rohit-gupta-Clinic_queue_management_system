import api from './client';
import { AuthResponse } from '../types';

export const login = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data);

export const register = (data: { username: string; password: string; name: string; role: string; doctorId?: number }) =>
  api.post('/auth/register', data).then((r) => r.data);

export const getProfile = () => api.get('/auth/profile').then((r) => r.data);
