import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { listDoctors, createDoctor, updateDoctor } from '../api/doctors';
import { getSettings, updateSettings } from '../api/settings';
import { Doctor, ClinicSettings } from '../types';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [tab, setTab] = useState<'doctors' | 'settings'>('doctors');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [docForm, setDocForm] = useState({ fullName: '', specialization: '', avgConsultationMinutes: 10 });
  const queryClient = useQueryClient();

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: listDoctors });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  const saveDoctor = async () => {
    if (!docForm.fullName) { toast.error('Doctor name required'); return; }
    try {
      if (editDoctor) {
        await updateDoctor(editDoctor.id, docForm);
      } else {
        await createDoctor(docForm);
      }
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setShowDoctorModal(false);
      setEditDoctor(null);
      setDocForm({ fullName: '', specialization: '', avgConsultationMinutes: 10 });
      toast.success(editDoctor ? 'Doctor updated' : 'Doctor created');
    } catch { toast.error('Failed to save doctor'); }
  };

  const handleEdit = (doc: Doctor) => {
    setEditDoctor(doc);
    setDocForm({ fullName: doc.fullName, specialization: doc.specialization || '', avgConsultationMinutes: doc.avgConsultationMinutes });
    setShowDoctorModal(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settings!);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>

        <div className="flex gap-2 border-b">
          <button onClick={() => setTab('doctors')} className={`px-4 py-2 ${tab === 'doctors' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}>
            Doctors
          </button>
          <button onClick={() => setTab('settings')} className={`px-4 py-2 ${tab === 'settings' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}>
            Clinic Settings
          </button>
        </div>

        {tab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Manage Doctors</h2>
              <button onClick={() => { setEditDoctor(null); setDocForm({ fullName: '', specialization: '', avgConsultationMinutes: 10 }); setShowDoctorModal(true); }}
                className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-700">
                + Add Doctor
              </button>
            </div>
            <div className="p-4">
              {doctors?.length === 0 ? <p className="text-gray-400">No doctors configured</p> : (
                <div className="space-y-2">
                  {doctors?.map((doc: Doctor) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">Dr. {doc.fullName}</p>
                        <p className="text-sm text-gray-500">{doc.specialization || 'General'} | {doc.avgConsultationMinutes} min/patient</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {doc.status}
                        </span>
                        <button onClick={() => handleEdit(doc)} className="text-sm text-primary-600 hover:underline">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'settings' && settings && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">Clinic Configuration</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Clinic Name</label>
                <input className="w-full border rounded-lg px-3 py-2" value={(settings as any).clinicName || ''}
                  onChange={(e) => queryClient.setQueryData(['settings'], { ...settings, clinicName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full border rounded-lg px-3 py-2" value={(settings as any).phone || ''}
                  onChange={(e) => queryClient.setQueryData(['settings'], { ...settings, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Consultation (minutes)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2" value={(settings as any).defaultConsultationMinutes || 10}
                  onChange={(e) => queryClient.setQueryData(['settings'], { ...settings, defaultConsultationMinutes: parseInt(e.target.value) })} />
              </div>
              <button onClick={handleSaveSettings} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showDoctorModal} onClose={() => { setShowDoctorModal(false); setEditDoctor(null); }} title={editDoctor ? 'Edit Doctor' : 'Add Doctor'}>
        <div className="space-y-3">
          <input placeholder="Full Name *" className="w-full border rounded-lg px-3 py-2" value={docForm.fullName}
            onChange={(e) => setDocForm({ ...docForm, fullName: e.target.value })} />
          <input placeholder="Specialization" className="w-full border rounded-lg px-3 py-2" value={docForm.specialization}
            onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })} />
          <input placeholder="Avg Consultation (min)" type="number" className="w-full border rounded-lg px-3 py-2" value={docForm.avgConsultationMinutes}
            onChange={(e) => setDocForm({ ...docForm, avgConsultationMinutes: parseInt(e.target.value) })} />
          <button onClick={saveDoctor} className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
            {editDoctor ? 'Update' : 'Create'} Doctor
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
