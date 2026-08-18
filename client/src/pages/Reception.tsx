import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import PatientSearch from '../components/PatientSearch';
import QueueTable from '../components/QueueTable';
import Modal from '../components/Modal';
import { listPatients, createPatient } from '../api/patients';
import { listDoctors } from '../api/doctors';
import { getQueue, addToQueue, callNext, skipPatient, completePatient } from '../api/queue';
import { Patient, Doctor, QueueEntry } from '../types';
import toast from 'react-hot-toast';
import { getCurrentAndNext } from '../api/queue';
import { useAuthStore } from '../store/authStore';

export default function Reception() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number>(0);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', age: '', gender: '' });
  const { user } = useAuthStore();

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: listDoctors });
  const { data: queue, refetch: refetchQueue } = useQuery({
    queryKey: ['queue', selectedDoctor],
    queryFn: () => getQueue(selectedDoctor),
    enabled: selectedDoctor > 0,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (doctors && doctors.length > 0 && selectedDoctor === 0) {
      setSelectedDoctor(doctors[0].id);
    }
  }, [doctors]);

  const handleAddToQueue = async () => {
    if (!selectedPatient || !selectedDoctor) { toast.error('Select patient and doctor'); return; }
    try {
      await addToQueue(selectedPatient.id, selectedDoctor, true);
      toast.success(`Token issued for ${selectedPatient.fullName}`);
      setSelectedPatient(null);
      refetchQueue();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add to queue');
    }
  };

  const handleCreatePatient = async () => {
    if (!form.fullName || !form.phoneNumber) { toast.error('Name and phone required'); return; }
    try {
      const patient = await createPatient({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
      });
      setSelectedPatient(patient);
      setShowNewPatient(false);
      setForm({ fullName: '', phoneNumber: '', age: '', gender: '' });
      toast.success('Patient registered');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleSkip = async (id: number) => {
    try { await skipPatient(id); refetchQueue(); toast.success('Patient skipped'); } catch { toast.error('Failed'); }
  };

  const handleComplete = async (id: number) => {
    try { await completePatient(id); refetchQueue(); toast.success('Consultation completed'); } catch { toast.error('Failed'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reception Desk</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h2 className="font-semibold mb-3">Register Patient</h2>
              <PatientSearch onSelect={setSelectedPatient} />
              {selectedPatient && (
                <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                  <p className="font-medium">{selectedPatient.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedPatient.phoneNumber}</p>
                  <button onClick={() => setSelectedPatient(null)} className="text-xs text-red-500 mt-1">Clear</button>
                </div>
              )}
              <button onClick={() => setShowNewPatient(true)} className="mt-3 text-sm text-primary-600 hover:underline">
                + New patient registration
              </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h2 className="font-semibold mb-3">Select Doctor</h2>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={0}>Choose doctor...</option>
                {doctors?.map((d: Doctor) => (
                  <option key={d.id} value={d.id}>Dr. {d.fullName} {d.specialization ? `(${d.specialization})` : ''}</option>
                ))}
              </select>

              {selectedPatient && selectedDoctor > 0 && (
                <button onClick={handleAddToQueue} className="w-full mt-3 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 font-medium">
                  Issue Token
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm border">
            <h2 className="font-semibold mb-3">Today's Queue</h2>
            {queue && (
              <QueueTable entries={queue} onSkip={handleSkip} onComplete={handleComplete} />
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showNewPatient} onClose={() => setShowNewPatient(false)} title="New Patient Registration">
        <div className="space-y-3">
          <input placeholder="Full Name *" className="w-full border rounded-lg px-3 py-2" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input placeholder="Phone Number *" className="w-full border rounded-lg px-3 py-2" value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <input placeholder="Age" type="number" className="w-full border rounded-lg px-3 py-2" value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <select className="w-full border rounded-lg px-3 py-2" value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <button onClick={handleCreatePatient} className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
            Register & Select
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
