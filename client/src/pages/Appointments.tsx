import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import PatientSearch from '../components/PatientSearch';
import { listDoctors } from '../api/doctors';
import { listAppointments, createAppointment, updateAppointmentStatus } from '../api/appointments';
import { Patient, Doctor, Appointment } from '../types';
import toast from 'react-hot-toast';

export default function Appointments() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ doctorId: 0, appointmentDate: '', appointmentTime: '' });
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: listDoctors });
  const { data: appointments } = useQuery({
    queryKey: ['appointments', today],
    queryFn: () => listAppointments({ date: today }),
  });

  const handleCreate = async () => {
    if (!selectedPatient || !form.doctorId || !form.appointmentDate || !form.appointmentTime) {
      toast.error('Fill all fields'); return;
    }
    try {
      await createAppointment({
        patientId: selectedPatient.id,
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowCreate(false);
      setSelectedPatient(null);
      setForm({ doctorId: 0, appointmentDate: '', appointmentTime: '' });
      toast.success('Appointment booked');
    } catch { toast.error('Failed to book'); }
  };

  const handleStatus = async (id: number, status: string) => {
    try { await updateAppointmentStatus(id, status); queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Updated'); }
    catch { toast.error('Failed'); }
  };

  const statusColors: Record<string, string> = {
    booked: 'bg-blue-100 text-blue-700',
    'checked-in': 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-600',
    'no-show': 'bg-yellow-100 text-yellow-700',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <button onClick={() => setShowCreate(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
            + New Appointment
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Today's Appointments ({today})</h2>
          </div>
          <div className="p-4">
            {!appointments?.length ? (
              <p className="text-gray-400 text-center py-4">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt: Appointment) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{apt.patient?.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {apt.appointmentTime} | Dr. {apt.doctor?.fullName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[apt.status] || ''}`}>
                        {apt.status}
                      </span>
                      {apt.status === 'booked' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleStatus(apt.id, 'checked-in')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Check-in</button>
                          <button onClick={() => handleStatus(apt.id, 'cancelled')} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Cancel</button>
                        </div>
                      )}
                      {apt.status === 'checked-in' && (
                        <button onClick={() => handleStatus(apt.id, 'completed')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Complete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Book Appointment">
        <div className="space-y-3">
          <PatientSearch onSelect={setSelectedPatient} placeholder="Search patient..." />
          {selectedPatient && (
            <div className="p-2 bg-primary-50 rounded text-sm">
              {selectedPatient.fullName} - {selectedPatient.phoneNumber}
            </div>
          )}
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: parseInt(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2">
            <option value={0}>Select Doctor</option>
            {doctors?.map((d: Doctor) => (
              <option key={d.id} value={d.id}>Dr. {d.fullName}</option>
            ))}
          </select>
          <input type="date" value={form.appointmentDate}
            onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2" />
          <input type="time" value={form.appointmentTime}
            onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
            className="w-full border rounded-lg px-3 py-2" />
          <button onClick={handleCreate} className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
            Book Appointment
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
