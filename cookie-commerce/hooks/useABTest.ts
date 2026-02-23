// hooks/useABTest.ts

'use client';

import { useState, useEffect } from 'react';
import { getVariant, trackConversion } from '@/lib/ab-testing/ab-test';

/**
 * Hook za A/B testiranje.
 * Vraća dodeljenu varijantu i funkciju za beleženje konverzije.
 * 
 * Primer korišćenja:
 * const { variant, convert } = useABTest('hero_cta');
 * if (variant === 'variant_a') { ... }
 * onClick={() => convert()} // Beleži konverziju
 */
export function useABTest(testId: string) {
    const [variant, setVariant] = useState<string>('control');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const v = getVariant(testId);
        const timer = setTimeout(() => {
            if (v !== variant) {
                setVariant(v);
            }
            setIsReady(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [testId, variant]);

    const convert = () => {
        trackConversion(testId, variant);
    };

    return { variant, isReady, convert };
}
