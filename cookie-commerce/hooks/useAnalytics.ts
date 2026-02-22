import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/tracker';

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Automatsko praćenje pregleda stranica (Page View)
  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    trackEvent('page_view', { url });
  }, [pathname, searchParams]);

  // Manuelno praćenje događaja
  const track = (eventType: string, data?: any) => {
    trackEvent(eventType, data);
  };

  return { track };
}
