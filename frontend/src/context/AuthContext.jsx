import { useEffect, useState } from 'react';
import { getMeApi, loginApi, logoutApi, registerApi, updateMeApi } from '../api/auth';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMeApi()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { user, token } = await loginApi(credentials);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const { user, token } = await registerApi(data);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const { user } = await updateMeApi(data);
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.role === 'admin', login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
