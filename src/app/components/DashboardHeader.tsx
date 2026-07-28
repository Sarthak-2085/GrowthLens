'use client';

import React, { useMemo } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useCampaigns } from './CampaignsProvider';

export default function DashboardHeader() {
  const { campaigns, loading, refetch } = useCampaigns();

  const summary = useMemo(() => {
    const channelCount = new Set(campaigns.map((c) => c.channel)).size;
    const dates = campaigns
      .flatMap((c) => [c.start_date, c.end_date])
      .filter((d): d is string => !!d)
      .sort();
    const range = dates.length
      ? `${new Date(dates[0]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${new Date(dates[dates.length - 1]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
      : null;
    return { channelCount, range };
  }, [campaigns]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-700 text-foreground tracking-tight">Campaign Dashboard</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 text-xs font-600 text-positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse-subtle" />
            Live
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
          {summary.channelCount > 0 ? ` across ${summary.channelCount} channel${summary.channelCount === 1 ? '' : 's'}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {summary.range && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <Activity size={13} />
            <span>{summary.range}</span>
          </div>
        )}
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-500 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
        <a
          href="/upload-data"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95"
        >
          Upload CSV
        </a>
      </div>
    </div>
  );
}
