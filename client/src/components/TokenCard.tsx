import { QueueEntry } from '../types';
import { ClockIcon, CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline';

interface Props {
  entry: QueueEntry;
  isCurrent?: boolean;
  onCall?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  showActions?: boolean;
}

export default function TokenCard({ entry, isCurrent, onCall, onSkip, onComplete, showActions }: Props) {
  const statusColors: Record<string, string> = {
    waiting: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    'in-progress': 'bg-green-100 border-green-300 text-green-800',
    completed: 'bg-gray-100 border-gray-300 text-gray-500',
    skipped: 'bg-red-100 border-red-300 text-red-600',
  };

  return (
    <div className={`border-2 rounded-lg p-4 queue-card-enter ${statusColors[entry.status] || 'bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">{entry.tokenNumber}</span>
        <span className={`text-sm px-2 py-1 rounded-full capitalize ${entry.status === 'waiting' ? 'bg-yellow-200' : entry.status === 'in-progress' ? 'bg-green-200' : 'bg-gray-200'}`}>
          {entry.status}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <UserIcon className="w-4 h-4" />
        <span className="font-medium">{entry.patient?.fullName || 'Unknown'}</span>
      </div>
      {entry.estimatedWaitMinutes != null && entry.status === 'waiting' && (
        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          Est. wait: ~{entry.estimatedWaitMinutes} min
        </div>
      )}
      {showActions && (
        <div className="flex gap-2 mt-3">
          {entry.status === 'waiting' && onCall && (
            <button onClick={onCall} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm hover:bg-green-700">
              Call Next
            </button>
          )}
          {entry.status === 'waiting' && onSkip && (
            <button onClick={onSkip} className="flex-1 bg-yellow-500 text-white py-1.5 rounded-lg text-sm hover:bg-yellow-600">
              Skip
            </button>
          )}
          {entry.status === 'in-progress' && onComplete && (
            <button onClick={onComplete} className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm hover:bg-blue-700">
              <CheckCircleIcon className="w-4 h-4 inline mr-1" />
              Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
