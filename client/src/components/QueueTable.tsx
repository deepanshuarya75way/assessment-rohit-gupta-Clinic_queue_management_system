import { QueueEntry } from '../types';

interface Props {
  entries: QueueEntry[];
  onSkip?: (id: number) => void;
  onComplete?: (id: number) => void;
}

export default function QueueTable({ entries, onSkip, onComplete }: Props) {
  if (entries.length === 0) {
    return <div className="text-center py-8 text-gray-400">No patients in queue</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-2 px-3 font-medium">Token</th>
            <th className="text-left py-2 px-3 font-medium">Patient</th>
            <th className="text-left py-2 px-3 font-medium">Phone</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
            <th className="text-left py-2 px-3 font-medium">Wait</th>
            <th className="text-left py-2 px-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3 font-bold">{entry.tokenNumber}</td>
              <td className="py-2 px-3">{entry.patient?.fullName || 'Unknown'}</td>
              <td className="py-2 px-3 text-gray-500">{entry.patient?.phoneNumber}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                  entry.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  entry.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                  entry.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                  'bg-red-100 text-red-600'
                }`}>
                  {entry.status}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-500">
                {entry.status === 'waiting' && entry.estimatedWaitMinutes != null
                  ? `~${entry.estimatedWaitMinutes} min`
                  : '-'}
              </td>
              <td className="py-2 px-3">
                <div className="flex gap-1">
                  {entry.status === 'waiting' && onSkip && (
                    <button onClick={() => onSkip(entry.id)} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">
                      Skip
                    </button>
                  )}
                  {entry.status === 'in-progress' && onComplete && (
                    <button onClick={() => onComplete(entry.id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                      Complete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
