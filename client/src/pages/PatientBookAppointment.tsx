import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listDoctors } from '../api/doctors';
import { patientBookAppointment } from '../api/patient';
import { Doctor } from '../types';
import toast from 'react-hot-toast';

export default function PatientBookAppointment() {
  const [doctorId, setDoctorId] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: listDoctors });

  // const tomorrow = new Date();
  // tomorrow.setDate(tomorrow.getDate() + 1);
  // const minDate = tomorrow.toISOString().split('T')[0];

  const today = new Date();

  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2,'0'),
    String(today.getDate()).padStart(2,'0'),
  ].join('-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !date || !time) {
      toast.error('Please select doctor, date, and time');
      return;
    }
    setLoading(true);
    try {
      await patientBookAppointment({ doctorId, appointmentDate: date, appointmentTime: time, notes });
      toast.success('Appointment booked successfully!');
      navigate('/patient/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-teal-700">Book Appointment</h1>
        <Link to="/patient/dashboard" className="text-sm text-teal-600 hover:underline">← Back</Link>
      </header>

      <div className="max-w-lg mx-auto p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Doctor</label>
              <select value={doctorId} onChange={(e) => setDoctorId(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500">
                <option value={0}>Select doctor...</option>
                {doctors?.filter((d: Doctor) => d.status === 'active').map((d: Doctor) => (
                  <option key={d.id} value={d.id}>Dr. {d.fullName} {d.specialization ? `(${d.specialization})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={date} min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input type="time" value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reason / Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                placeholder="Brief reason for visit..." />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
