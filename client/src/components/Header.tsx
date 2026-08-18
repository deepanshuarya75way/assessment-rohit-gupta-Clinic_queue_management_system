import { Bars3Icon } from '@heroicons/react/24/outline';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export default function Header() {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <button onClick={toggleSidebar} className="p-1 hover:bg-gray-100 rounded-lg">
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Welcome,</span>
        <span className="font-medium text-sm">{user?.name}</span>
      </div>
    </header>
  );
}
