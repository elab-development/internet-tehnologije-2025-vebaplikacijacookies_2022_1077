// lib/ab-testing/ab-test.ts

/**
 * A/B Testing modul
 * Koristi kolačiće za nasumično dodeljivanje varijanti i praćenje konverzija.
 */

export interface ABTest {
    id: string;
    name: string;
    variants: string[];       // npr. ['control', 'variant_a']
    weights?: number[];       // težine za svaku varijantu (podrazumevano ravnomerno)
}

// Aktivni A/B testovi
export const ACTIVE_TESTS: ABTest[] = [
    {
        id: 'hero_cta',
        name: 'Hero CTA dugme',
        variants: ['control', 'variant_a'],
        weights: [50, 50],
    },
    {
        id: 'product_layout',
        name: 'Layout proizvoda',
        variants: ['grid', 'list'],
        weights: [50, 50],
    },
];

/**
 * Dohvata ili dodeljuje varijantu za dati test.
 * Koristi cookie `ab_{testId}` za persistenciju.
 */
export function getVariant(testId: string): string {
    const test = ACTIVE_TESTS.find((t) => t.id === testId);
    if (!test) return 'control';

    // Proveri da li već postoji cookie
    if (typeof document !== 'undefined') {
        const cookieValue = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`ab_${testId}=`));

        if (cookieValue) {
            return cookieValue.split('=')[1];
        }

        // Nasumično dodeli varijantu po težinama
        const variant = assignVariant(test);

        // Sačuvaj u cookie (30 dana)
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `ab_${testId}=${variant}; path=/; expires=${expires}; SameSite=Lax`;

        return variant;
    }

    return test.variants[0]; // Fallback za server-side
}

/**
 * Nasumično dodeljuje varijantu po težinama
 */
function assignVariant(test: ABTest): string {
    const weights = test.weights || test.variants.map(() => 100 / test.variants.length);
    const total = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * total;

    let cumulative = 0;
    for (let i = 0; i < test.variants.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) return test.variants[i];
    }

    return test.variants[0];
}

/**
 * Beleži konverziju za A/B test
 */
export async function trackConversion(testId: string, variant: string) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'ab_conversion',
                eventData: { testId, variant },
                pageUrl: typeof window !== 'undefined' ? window.location.pathname : '',
            }),
            keepalive: true,
        });
    } catch {
        // Silent fail
    }
}
