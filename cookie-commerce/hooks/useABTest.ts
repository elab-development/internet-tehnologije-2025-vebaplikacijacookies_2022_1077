// hooks/useABTest.ts

'use client';

import { useState, useEffect } from 'react';
import { getVariant, trackConversion, ACTIVE_TESTS } from '@/lib/ab-testing/ab-test';

/**
 * Hook za A/B testiranje.
 * Vraća dodeljenu varijantu i funkciju za beleženje konverzije.
 *
 * Podržava URL param override za demo/testiranje:
 *   ?ab_hero_cta=variant_a   → forsira varijantu bez izmene cookie-a
 *
 * Primer korišćenja:
 * const { variant, convert, forceVariant } = useABTest('hero_cta');
 * if (variant === 'variant_a') { ... }
 * onClick={() => convert()} // Beleži konverziju
 */
export function useABTest(testId: string) {
    const [variant, setVariant] = useState<string>('control');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // 1. Proveri URL param override (?ab_{testId}=variant_a)
        const urlParams = new URLSearchParams(window.location.search);
        const urlOverride = urlParams.get(`ab_${testId}`);

        const test = ACTIVE_TESTS.find(t => t.id === testId);
        const validVariants = test?.variants ?? [];

        if (urlOverride && validVariants.includes(urlOverride)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVariant(urlOverride);
            setIsReady(true);
            return;
        }

        // 2. Normalna logika: cookie ili nova nasumična dodela
        const v = getVariant(testId);
        const timer = setTimeout(() => {
            setVariant(v);
            setIsReady(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [testId]);

    const convert = () => {
        trackConversion(testId, variant);
    };

    /**
     * Forsira određenu varijantu i ažurira cookie.
     * Korisno za demo i debugovanje.
     */
    const forceVariant = (v: string) => {
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `ab_${testId}=${v}; path=/; expires=${expires}; SameSite=Lax`;
        setVariant(v);
    };

    return { variant, isReady, convert, forceVariant };
}
