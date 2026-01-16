// hooks/useAuth.ts

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook za upravljanje autentifikacijom
 * 
 * @example
 * const { user, login, logout, isLoading } = useAuth();
 */
export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // ==========================================
  // UČITAVANJE TRENUTNOG KORISNIKA
  // ==========================================

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        error: 'Greška pri proveri autentifikacije',
      });
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Prijava nije uspela');
      }

      // Sinhronizuj korpu nakon prijave
      await fetch('/api/cart/sync', {
        method: 'POST',
        credentials: 'include',
      });

      setAuthState({
        user: data.user,
        isLoading: false,
        error: null,
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));

      return { success: false, error: error.message };
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registracija nije uspela');
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));

      return { success: true, message: data.message };
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));

      return { success: false, error: error.message };
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });

      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    register,
    logout,
    checkAuth,
  };
}