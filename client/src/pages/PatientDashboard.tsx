import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientQueueStatus, patientAppointments } from '../api/patient';
import { listDoctors } from '../api/doctors';
import { Doctor } from '../types';

function PatientHeader() {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem('cqms-patient') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('cqms-patient-token');
    localStorage.removeItem('cqms-patient');
    navigate('/patient/login');
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-teal-700">Patient Portal</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{patient.fullName}</span>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
      </div>
    </header>
  );
}

function QueueStatus() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patient-queue-status'],
    queryFn: patientQueueStatus,
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="animate-pulse h-24 bg-gray-100 rounded-xl" />;

  if (!data?.active) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold mb-2">Queue Status</h2>
        <p className="text-gray-400">No active queue entry today.</p>
        <p className="text-sm text-gray-400">Visit the clinic reception or book an appointment below.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h2 className="font-semibold mb-3">Your Queue Status</h2>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">Token Number</p>
          <p className="text-3xl font-bold text-teal-600">{data.token}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm capitalize ${
          data.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {data.status}
        </div>
      </div>
      {data.doctorName && <p className="text-sm text-gray-500">Doctor: Dr. {data.doctorName}</p>}
      {data.estimatedWaitMinutes != null && data.status === 'waiting' && (
        <p className="text-sm text-gray-500 mt-1">Estimated wait: ~{data.estimatedWaitMinutes} min</p>
      )}
      <button onClick={() => refetch()} className="mt-3 text-sm text-teal-600 hover:underline">
        Refresh status
      </button>
    </div>
  );
}

function Appointments() {
  const { data, isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: patientAppointments,
  });

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Your Appointments</h2>
        <Link to="/patient/book" className="text-sm text-teal-600 hover:underline font-medium">
          + Book New
        </Link>
      </div>
      {!data?.length ? (
        <p className="text-gray-400">No appointments yet</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 5).map((apt: any) => (
            <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
              <div>
                <p className="font-medium">Dr. {apt.doctor?.fullName}</p>
                <p className="text-gray-500">{apt.appointmentDate} at {apt.appointmentTime}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                apt.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
              }`}>{apt.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PatientDashboard() {
  const patient = JSON.parse(localStorage.getItem('cqms-patient') || '{}');

  if (!patient.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to="/patient/login" className="bg-teal-600 text-white px-6 py-3 rounded-lg">Login First</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientHeader />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold">Welcome!</h2>
          <p className="text-teal-100">Manage your appointments and track queue status.</p>
        </div>
        <QueueStatus />
        <Appointments />
      </div>
    </div>
  );
}
