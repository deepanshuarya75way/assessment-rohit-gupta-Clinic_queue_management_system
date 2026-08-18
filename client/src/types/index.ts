export interface User {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'doctor' | 'receptionist';
  doctorId: number | null;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; role: string; doctorId: number | null };
}

export interface Patient {
  id: number;
  fullName: string;
  phoneNumber: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  createdAt: string;
}

export interface Doctor {
  id: number;
  fullName: string;
  specialization: string | null;
  workingHours: Record<string, { start: string; end: string }> | null;
  status: 'active' | 'on-leave' | 'break';
  departmentId: number | null;
  avgConsultationMinutes: number;
}

export interface QueueEntry {
  id: number;
  tokenNumber: string;
  patientId: number;
  doctorId: number;
  queueDate: string;
  sequenceNumber: number;
  status: 'waiting' | 'in-progress' | 'completed' | 'skipped';
  calledAt: string | null;
  completedAt: string | null;
  isWalkIn: boolean;
  estimatedWaitMinutes: number | null;
  patient: Patient;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'booked' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
  notes: string | null;
  patient: Patient;
  doctor: Doctor;
}

export interface Visit {
  id: number;
  patientId: number;
  doctorId: number;
  visitDate: string;
  diagnosis: string | null;
  prescription: string | null;
  notes: string | null;
  reasonForVisit: string | null;
  doctor: Doctor;
}

export interface ClinicSettings {
  id: number;
  clinicName: string;
  address: string | null;
  phone: string | null;
  workingHours: Record<string, { start: string; end: string }> | null;
  holidays: string[] | null;
  defaultConsultationMinutes: number;
  tokenCounter: number;
  tokenCounterDate: string | null;
}
