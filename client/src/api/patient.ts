import patientApi from './patientClient';

export interface PatientAuthResponse {
  token: string;
  patient: {
    id: number;
    fullName: string;
    phoneNumber: string;
    age: number | null;
    gender: string | null;
  };
}

export const patientRegister = (data: { fullName: string; phoneNumber: string; password: string; age?: number; gender?: string }) =>
  patientApi.post<PatientAuthResponse>('/patient/register', data).then((r) => r.data);

export const patientLogin = (phoneNumber: string, password: string) =>
  patientApi.post<PatientAuthResponse>('/patient/login', { phoneNumber, password }).then((r) => r.data);

export const patientAppointments = () =>
  patientApi.get('/patient/appointments').then((r) => r.data);

export const patientQueueStatus = () =>
  patientApi.get('/patient/queue-status').then((r) => r.data);

export const patientBookAppointment = (data: { doctorId: number; appointmentDate: string; appointmentTime: string; notes?: string }) =>
  patientApi.post('/patient/book-appointment', data).then((r) => r.data);
