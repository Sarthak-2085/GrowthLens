'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getAnalyticsSummary,
  getRecommendations,
  type AnalyticsSummary,
  type Recommendation,
} from '@/lib/api';

interface AnalyticsContextValue {
  summary: AnalyticsSummary | null;
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([getAnalyticsSummary(), getRecommendations()])
      .then(([summaryData, recommendationsData]) => {
        if (cancelled) return;
        setSummary(summaryData);
        setRecommendations(recommendationsData);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'Failed to load analytics.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <AnalyticsContext.Provider value={{ summary, recommendations, loading, error, refetch }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return ctx;
}
