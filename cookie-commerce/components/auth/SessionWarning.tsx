// components/auth/SessionWarning.tsx

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Prikazuje upozorenje kada sesija uskoro ističe.
 * Provjerava svakih 60 sekundi. Kad ostane < 5 min → countdown + "Produži" dugme.
 */
export function SessionWarning() {
    const { user, logout } = useAuth();
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [extending, setExtending] = useState(false);

    const WARNING_THRESHOLD = 5 * 60; // 5 minuta

    const checkSession = useCallback(async () => {
        if (!user) return;

        try {
            const res = await fetch('/api/auth/session', { credentials: 'include' });
            const data = await res.json();

            if (data.success && data.data?.expiresAt) {
                const expiresAt = new Date(data.data.expiresAt).getTime();
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

                if (remaining <= 0) {
                    // Sesija je istekla
                    await logout();
                    return;
                }

                if (remaining <= WARNING_THRESHOLD) {
                    setSecondsLeft(remaining);
                    setShowWarning(true);
                } else {
                    setShowWarning(false);
                    setSecondsLeft(null);
                }
            }
        } catch {
            // Silent fail — ne prekidaj rad aplikacije
        }
    }, [user, logout]);

    // Periodična provera sesije
    useEffect(() => {
        if (!user) return;

        checkSession();
        const interval = setInterval(checkSession, 60_000); // Svaki minut
        return () => clearInterval(interval);
    }, [user, checkSession]);

    // Countdown tajmer
    useEffect(() => {
        if (!showWarning || secondsLeft === null) return;

        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    logout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showWarning, logout]);

    const handleExtend = async () => {
        setExtending(true);
        try {
            const res = await fetch('/api/auth/session', {
                method: 'PUT',
                credentials: 'include',
            });
            const data = await res.json();

            if (data.success) {
                setShowWarning(false);
                setSecondsLeft(null);
            }
        } catch {
            // Silent
        } finally {
            setExtending(false);
        }
    };

    if (!showWarning || secondsLeft === null) return null;

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-sm animate-bounce-once">
            <div className="bg-orange-600 text-white rounded-xl shadow-2xl p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Sesija uskoro ističe</p>
                        <p className="text-orange-100 text-xs mt-1">
                            Preostalo: <span className="font-mono font-bold text-white text-sm">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleExtend}
                        disabled={extending}
                        className="flex-1 bg-white text-orange-600 font-semibold text-sm py-2 rounded-lg hover:bg-orange-50 transition disabled:opacity-50"
                    >
                        {extending ? 'Produžavanje...' : 'Produži sesiju'}
                    </button>
                    <button
                        onClick={() => logout()}
                        className="px-3 py-2 text-orange-200 hover:text-white text-sm transition"
                    >
                        Odjavi se
                    </button>
                </div>
            </div>
        </div>
    );
}
