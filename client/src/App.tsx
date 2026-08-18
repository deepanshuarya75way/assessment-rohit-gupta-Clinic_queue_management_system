import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Reception from './pages/Reception';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminPanel from './pages/AdminPanel';
import DisplayScreen from './pages/DisplayScreen';
import Appointments from './pages/Appointments';
import Reports from './pages/Reports';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import PatientBookAppointment from './pages/PatientBookAppointment';
import LandingPage from './pages/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function DashboardRedirect() {
  const { user } = useAuthStore();
  const token = localStorage.getItem('cqms-token');
  const patientToken = localStorage.getItem('cqms-patient-token');

  if (token && user) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/reception" replace />;
      }
    } catch {}
    localStorage.removeItem('cqms-token');
    localStorage.removeItem('cqms-user');
  }

  if (patientToken) {
    try {
      const payload = JSON.parse(atob(patientToken.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        return <Navigate to="/patient/dashboard" replace />;
      }
    } catch {}
    localStorage.removeItem('cqms-patient-token');
    localStorage.removeItem('cqms-patient');
  }

  return <LandingPage />;
}

function PatientRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('cqms-patient-token');
  if (!token) return <Navigate to="/patient/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/display" element={<DisplayScreen />} />
          <Route path="/" element={<DashboardRedirect />} />

          <Route path="/reception" element={
            <ProtectedRoute roles={['admin', 'receptionist']}><Reception /></ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute roles={['admin', 'receptionist']}><Appointments /></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>
          } />

          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/dashboard" element={<PatientRoute><PatientDashboard /></PatientRoute>} />
          <Route path="/patient/book" element={<PatientRoute><PatientBookAppointment /></PatientRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </QueryClientProvider>
  );
}
