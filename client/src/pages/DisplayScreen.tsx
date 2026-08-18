import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listDoctors } from '../api/doctors';
import { getCurrentAndNext } from '../api/queue';
import { Doctor, QueueEntry } from '../types';
import { usePublicSocket } from '../hooks/usePublicSocket';

function DoctorColumn({ doctor }: { doctor: Doctor }) {
  const { data, refetch } = useQuery({
    queryKey: ['display-queue', doctor.id],
    queryFn: () => getCurrentAndNext(doctor.id),
    refetchInterval: 30000,
  });

  const socketRef = usePublicSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (payload: any) => {
      if (payload.doctorId === doctor.id) refetch();
    };
    socket.on('queue:updated', handler);
    return () => { socket.off('queue:updated', handler); };
  }, [socketRef, doctor.id, refetch]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-primary-700">Dr. {doctor.fullName}</h2>
        <p className="text-sm text-gray-500">{doctor.specialization || 'General'}</p>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 mb-1">Now Serving</p>
        {data?.current ? (
          <div className="text-4xl font-bold text-green-600 animate-pulse">
            {data.current.tokenNumber}
          </div>
        ) : (
          <div className="text-2xl text-gray-300">---</div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Waiting List</p>
        <div className="space-y-2">
          {data?.next?.length ? (
            data.next.slice(0, 8).map((entry: QueueEntry) => (
              <div key={entry.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span className="font-bold text-lg">{entry.tokenNumber}</span>
                <span className="text-sm text-gray-500">{entry.patient?.fullName}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No patients waiting</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DisplayScreen() {
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: listDoctors });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Clinic Queue Status</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors?.filter((d: Doctor) => d.status === 'active').map((doctor: Doctor) => (
          <DoctorColumn key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
