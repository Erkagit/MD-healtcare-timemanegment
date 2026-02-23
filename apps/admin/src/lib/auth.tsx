'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, ApiError, type Admin } from '@/lib/api';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_user');

    if (token && storedAdmin) {
      try {
        // Basic JWT expiry check (decode payload without verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000; // JWT exp is in seconds

        if (Date.now() >= expiresAt) {
          console.warn('[Auth] Token expired, clearing session');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        } else {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch {
        console.error('[Auth] Failed to parse stored session');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }

    setIsLoading(false);
  }, []);

  // Listen for auth:error events from fetchAPI (401/403 responses)
  useEffect(() => {
    const handleAuthError = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.warn('[Auth] Session invalidated by API:', detail?.message);
      setAdmin(null);
      router.push('/login');
    };

    window.addEventListener('auth:error', handleAuthError);
    return () => window.removeEventListener('auth:error', handleAuthError);
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      if (!response.token) {
        throw new Error('Серверээс токен ирсэнгүй');
      }

      localStorage.setItem('admin_token', response.token);
      localStorage.setItem('admin_user', JSON.stringify(response.user));

      setAdmin(response.user);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
