import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/tracker';

/**
 * Tracks page views automatically on route change.
 * Must be used inside a <Suspense> boundary (requires useSearchParams).
 */
export function usePageViewTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Automatsko praćenje pregleda stranica (Page View)
  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    trackEvent('page_view', { url });
  }, [pathname, searchParams]);
}

/**
 * Returns a track() function for manual event tracking.
 * Safe to use anywhere — does not call useSearchParams.
 */
export function useAnalytics() {
  // Manuelno praćenje događaja
  const track = (eventType: string, data?: any) => {
    trackEvent(eventType, data);
  };

  return { track };
}
