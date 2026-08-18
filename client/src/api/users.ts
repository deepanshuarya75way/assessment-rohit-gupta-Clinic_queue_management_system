import api from './client';
import { User } from '../types';

export const listUsers = () =>
  api.get<User[]>('/users').then((r) => r.data);

export const createUser = (data: { username: string; password: string; name: string; role: string; doctorId?: number }) =>
  api.post('/users', data).then((r) => r.data);

export const toggleUserActive = (id: number) =>
  api.patch(`/users/${id}/toggle-active`).then((r) => r.data);
