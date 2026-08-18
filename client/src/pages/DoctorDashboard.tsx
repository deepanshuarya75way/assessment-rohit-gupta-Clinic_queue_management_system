import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import TokenCard from '../components/TokenCard';
import { useAuthStore } from '../store/authStore';
import { getCurrentAndNext, callNext, skipPatient, completePatient } from '../api/queue';
import { getVisitHistory, createVisit } from '../api/visits';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const doctorId = user?.doctorId || 0;
  const queryClient = useQueryClient();
  const socketRef = useSocket();
  const [showHistory, setShowHistory] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState({ diagnosis: '', prescription: '', notes: '', reasonForVisit: '' });

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['doctor-queue', doctorId],
    queryFn: () => getCurrentAndNext(doctorId),
    enabled: doctorId > 0,
    refetchInterval: 10000,
  });

  const { data: history } = useQuery({
    queryKey: ['visit-history', data?.current?.patientId],
    queryFn: () => getVisitHistory(data!.current!.patientId),
    enabled: showHistory && !!data?.current?.patientId,
  });

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (payload: any) => {
      if (payload.doctorId === doctorId) refetch();
    };
    socket.on('queue:updated', handler);
    return () => { socket.off('queue:updated', handler); };
  }, [socketRef, doctorId, refetch]);

  const handleCallNext = async () => {
    try { await callNext(doctorId); refetch(); toast.success('Patient called'); } catch { toast.error('No waiting patients'); }
  };

  const handleSkip = async (id: number) => {
    try { await skipPatient(id); refetch(); } catch { toast.error('Failed'); }
  };

  const handleComplete = async (id: number) => {
    try {
      await completePatient(id);
      if (notes.diagnosis || notes.prescription || notes.notes) {
        await createVisit({
          patientId: data!.current!.patientId,
          doctorId,
          ...notes,
        });
        setNotes({ diagnosis: '', prescription: '', notes: '', reasonForVisit: '' });
      }
      refetch();
      setShowNotes(false);
      toast.success('Consultation completed');
    } catch { toast.error('Failed to complete'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <span className="text-sm text-gray-500">Dr. {user?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="font-semibold mb-4">Current Patient</h2>
              {isLoading ? (
                <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
              ) : data?.current ? (
                <div>
                  <TokenCard
                    entry={data.current}
                    isCurrent
                    showActions
                    onComplete={() => setShowNotes(true)}
                  />
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setShowHistory(true)} className="text-sm text-primary-600 hover:underline">
                      View History
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg mb-2">No patient in consultation</p>
                  <button onClick={handleCallNext} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                    Call Next Patient
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Upcoming Patients</h2>
                {data?.current && (
                  <button onClick={handleCallNext} className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-700">
                    Call Next
                  </button>
                )}
              </div>
              {!data?.next?.length ? (
                <p className="text-gray-400 text-center py-4">No patients waiting</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.next.map((entry, idx) => (
                    <TokenCard key={entry.id} entry={entry} showActions={false} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h2 className="font-semibold mb-3">Queue Summary</h2>
              {data && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">In Consultation</span>
                    <span className="font-bold text-green-600">{data.current ? 1 : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Waiting</span>
                    <span className="font-bold text-yellow-600">{data.next.length}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Today</span>
                      <span className="font-bold">{(data.next.length + (data.current ? 1 : 0))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showHistory && history && (
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">Visit History</h2>
                  <button onClick={() => setShowHistory(false)} className="text-xs text-gray-400">&times;</button>
                </div>
                {history.length === 0 ? (
                  <p className="text-gray-400 text-sm">No previous visits</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.slice(0, 3).map((v: any) => (
                      <div key={v.id} className="text-xs border-b pb-2">
                        <p className="font-medium">{v.visitDate}</p>
                        {v.diagnosis && <p className="text-gray-600">Dx: {v.diagnosis}</p>}
                        {v.prescription && <p className="text-gray-600">Rx: {v.prescription}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNotes(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Consultation Notes</h3>
            <div className="space-y-3">
              <input placeholder="Reason for visit" className="w-full border rounded-lg px-3 py-2"
                value={notes.reasonForVisit} onChange={(e) => setNotes({ ...notes, reasonForVisit: e.target.value })} />
              <textarea placeholder="Diagnosis" className="w-full border rounded-lg px-3 py-2" rows={2}
                value={notes.diagnosis} onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })} />
              <textarea placeholder="Prescription" className="w-full border rounded-lg px-3 py-2" rows={3}
                value={notes.prescription} onChange={(e) => setNotes({ ...notes, prescription: e.target.value })} />
              <textarea placeholder="Additional notes" className="w-full border rounded-lg px-3 py-2" rows={2}
                value={notes.notes} onChange={(e) => setNotes({ ...notes, notes: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={() => setShowNotes(false)} className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button onClick={() => handleComplete(data!.current!.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Save & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
