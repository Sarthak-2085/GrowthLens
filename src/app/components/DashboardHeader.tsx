import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-700 text-foreground tracking-tight">
            Campaign Dashboard
          </h1>
          <span className="flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 text-xs font-600 text-positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse-subtle" />
            Live
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          8 campaigns across 6 channels · Last synced 22 Jul 2026, 17:51 IST
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Activity size={13} />
          <span>Aug 2025 – Mar 2026</span>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-500 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95">
          <RefreshCw size={13} />
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