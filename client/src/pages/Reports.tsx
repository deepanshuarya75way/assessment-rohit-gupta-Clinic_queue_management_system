import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { getFootfall, getWaitTimes, getDoctorStats } from '../api/reports';
import { listDoctors } from '../api/doctors';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Doctor } from '../types';

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({ start: weekAgo, end: today });
  const [selectedDoctor, setSelectedDoctor] = useState<number>(0);

  const { data: footfall } = useQuery({
    queryKey: ['report-footfall', dateRange],
    queryFn: () => getFootfall(dateRange.start, dateRange.end),
  });

  const { data: waitTimes } = useQuery({
    queryKey: ['report-wait-times', dateRange],
    queryFn: () => getWaitTimes(dateRange.start, dateRange.end),
  });

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: listDoctors });

  const { data: doctorStats } = useQuery({
    queryKey: ['report-doctor-stats', selectedDoctor, dateRange],
    queryFn: () => getDoctorStats(selectedDoctor, dateRange.start, dateRange.end),
    enabled: selectedDoctor > 0,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>

        <div className="flex gap-4 items-end bg-white p-4 rounded-xl shadow-sm border">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="font-semibold mb-4">Daily Patient Footfall</h2>
            {footfall?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={footfall}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">No data for selected period</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
            <h2 className="font-semibold">Summary Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Avg Wait Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {waitTimes?.avgWaitMinutes ? Math.round(parseFloat(waitTimes.avgWaitMinutes)) : '-'} min
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Called</p>
                <p className="text-2xl font-bold text-green-600">{waitTimes?.totalCalled || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Doctor-wise Stats</label>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mb-3">
                <option value={0}>Select doctor...</option>
                {doctors?.map((d: Doctor) => (
                  <option key={d.id} value={d.id}>Dr. {d.fullName}</option>
                ))}
              </select>
              {doctorStats && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-lg font-bold">{doctorStats.totalPatients}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-lg font-bold text-green-600">{doctorStats.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-lg font-bold text-yellow-600">{doctorStats.completionRate}%</p>
                    <p className="text-xs text-gray-500">Rate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
