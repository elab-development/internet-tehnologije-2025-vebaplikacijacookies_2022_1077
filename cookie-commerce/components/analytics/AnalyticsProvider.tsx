'use client';

import { usePageViewTracking } from '@/hooks/useAnalytics';

export function AnalyticsProvider() {
  usePageViewTracking();
  return null;
}
