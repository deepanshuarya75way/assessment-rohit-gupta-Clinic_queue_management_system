import { Request } from 'express';

export interface JwtPayload {
  userId: number;
  role: 'admin' | 'doctor' | 'receptionist';
  doctorId?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type QueueStatus = 'waiting' | 'in-progress' | 'completed' | 'skipped';
export type AppointmentStatus = 'booked' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
export type UserRole = 'admin' | 'doctor' | 'receptionist';
export type DoctorStatus = 'active' | 'on-leave' | 'break';
