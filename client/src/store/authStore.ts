import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { id: number; name: string; role: string; doctorId: number | null } | null;
  setAuth: (token: string, user: { id: number; name: string; role: string; doctorId: number | null }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('cqms-token'),
  user: JSON.parse(localStorage.getItem('cqms-user') || 'null'),

  setAuth: (token, user) => {
    localStorage.setItem('cqms-token', token);
    localStorage.setItem('cqms-user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('cqms-token');
    localStorage.removeItem('cqms-user');
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
}));
