import React, { createContext, useContext, useEffect, useState } from 'react';
import storage from '../lib/storage';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await storage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await api.get('/api/auth/me');
        setUser(res.data);
      }
    } catch {
      try { await storage.removeItem('auth_token'); } catch { /* ignore */ }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    await storage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (email: string, password: string, full_name: string) => {
    const res = await api.post('/api/auth/register', { email, password, full_name });
    const { token: newToken, user: newUser } = res.data;
    await storage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await storage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAdmin: user?.role === 'admin',
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
