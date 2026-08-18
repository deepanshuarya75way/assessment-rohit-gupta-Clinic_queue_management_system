import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login as apiLogin } from '../api/auth';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, logout, user, token, isAuthenticated } = useAuthStore();

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    setAuth(res.token, res.user);
    return res;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return { login, logout: handleLogout, user, token, isAuthenticated: isAuthenticated() };
}
