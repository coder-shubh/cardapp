'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, type User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    auth
      .me()
      .then((u) => {
        setUserState(u);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await auth.login({ email, password });
    localStorage.setItem('token', token);
    setUserState(u);
  }, []);

  const register = useCallback(
    async (data: { name: string; username: string; email: string; password: string }) => {
      const { token, user: u } = await auth.register(data);
      localStorage.setItem('token', token);
      setUserState(u);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUserState(null);
    auth.logout().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
