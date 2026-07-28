'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCampaigns, type Campaign } from '@/lib/api';

interface CampaignsContextValue {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getCampaigns()
      .then((data) => {
        if (!cancelled) setCampaigns(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'Failed to load campaigns.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <CampaignsContext.Provider value={{ campaigns, loading, error, refetch }}>
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns(): CampaignsContextValue {
  const ctx = useContext(CampaignsContext);
  if (!ctx) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return ctx;
}
