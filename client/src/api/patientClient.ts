import axios from 'axios';

const patientApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

patientApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('cqms-patient-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

patientApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cqms-patient-token');
      localStorage.removeItem('cqms-patient');
      window.location.href = '/patient/login';
    }
    return Promise.reject(err);
  }
);

export default patientApi;
