import { NavLink } from 'react-router-dom';
import {
  HomeIcon, UserGroupIcon, CalendarDaysIcon, ClipboardDocumentListIcon,
  ChartBarIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const navItems = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: HomeIcon },
    { to: '/reception', label: 'Reception', icon: UserGroupIcon },
    { to: '/appointments', label: 'Appointments', icon: CalendarDaysIcon },
    { to: '/admin/doctors', label: 'Doctors', icon: UsersIcon },
    { to: '/reports', label: 'Reports', icon: ChartBarIcon },
    { to: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: HomeIcon },
  ],
  receptionist: [
    { to: '/reception', label: 'Reception', icon: UserGroupIcon },
    { to: '/appointments', label: 'Appointments', icon: CalendarDaysIcon },
    { to: '/display', label: 'Display Screen', icon: ClipboardDocumentListIcon },
  ],
};

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const items = navItems[user.role as keyof typeof navItems] || [];

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r overflow-hidden flex flex-col`}>
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold text-primary-700">CQMS</h1>
        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
