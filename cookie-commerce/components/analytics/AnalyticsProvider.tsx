'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics(); // Inicijalizuje page_view tracking
  return <>{children}</>;
}
