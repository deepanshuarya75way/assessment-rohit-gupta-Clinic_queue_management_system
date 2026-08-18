import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientLogin, patientRegister } from '../api/patient';
import toast from 'react-hot-toast';

export default function PatientLogin() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      if (!phone || !password) { toast.error('Fill all fields'); return; }
      setLoading(true);
      try {
        const res = await patientLogin(phone, password);
        localStorage.setItem('cqms-patient-token', res.token);
        localStorage.setItem('cqms-patient', JSON.stringify(res.patient));
        toast.success(`Welcome, ${res.patient.fullName}`);
        navigate('/patient/dashboard');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Login failed');
      }
    } else {
      if (!name || !phone || !password) { toast.error('Fill all fields'); return; }
      setLoading(true);
      try {
        const res = await patientRegister({ fullName: name, phoneNumber: phone, password, age: age ? parseInt(age) : undefined, gender });
        localStorage.setItem('cqms-patient-token', res.token);
        localStorage.setItem('cqms-patient', JSON.stringify(res.patient));
        toast.success('Registered successfully');
        navigate('/patient/dashboard');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Registration failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-700">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Patient Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Track your queue and appointments' : 'Create your account'}
          </p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'login' ? 'bg-white shadow' : 'text-gray-500'}`}
          >Login</button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'register' ? 'bg-white shadow' : 'text-gray-500'}`}
          >Register</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input type="text" placeholder="Full Name *" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
          )}
          <input type="tel" placeholder="Phone Number *" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
          {mode === 'register' && (
            <div className="flex gap-2">
              <input type="number" placeholder="Age" value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500">
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
          <input type="password" placeholder="Password *" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />

          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-teal-600 hover:underline">Back to clinic</Link>
        </div>
      </div>
    </div>
  );
}
