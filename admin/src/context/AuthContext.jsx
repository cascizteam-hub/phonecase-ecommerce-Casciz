import { useEffect, useState } from 'react';
import { getMeApi, loginApi, logoutApi } from '../api/auth';
import { AuthContext } from './auth-context';

const TOKEN_KEY = 'admin_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getMeApi()
      .then(({ user }) => {
        if (user.role !== 'admin') {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        } else {
          setUser(user);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { user, token } = await loginApi(credentials);
    if (user.role !== 'admin') {
      const err = new Error('This account does not have admin access');
      err.isAuthError = true;
      throw err;
    }
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}
