'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export function SessionTimeoutWarning() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Provera svakih 60 sekundi
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSessionStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Countdown timer kada se warning prikaže
  useEffect(() => {
    if (showWarning && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showWarning && countdown === 0) {
      handleLogout();
    }
  }, [showWarning, countdown]);

  const checkSessionStatus = async () => {
    try {
      const res = await fetch('/api/auth/session-status');
      const data = await res.json();

      // Ako je ostalo manje od 5 minuta (300s)
      if (data.success && data.expiresIn < 300 && data.expiresIn > 0) {
        setCountdown(data.expiresIn);
        setShowWarning(true);
      }
    } catch (error) {
      console.error('Session check failed', error);
    }
  };

  const handleExtendSession = async () => {
    try {
      const res = await fetch('/api/auth/extend-session', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setShowWarning(false);
        // Opciono: osveži stranicu ili samo nastavi
      } else {
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowWarning(false);
    router.push('/login?reason=timeout');
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 border-l-4 border-yellow-500">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Istek sesije
        </h3>
        <p className="text-gray-600 mb-6">
          Vaša sesija će isteći za <span className="font-bold text-red-600">{Math.floor(countdown / 60)}m {countdown % 60}s</span>.
          Da li želite da ostanete prijavljeni?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleLogout} size="sm">
            Odjavi me
          </Button>
          <Button variant="primary" onClick={handleExtendSession} size="sm">
            Produži sesiju
          </Button>
        </div>
      </div>
    </div>
  );
}
