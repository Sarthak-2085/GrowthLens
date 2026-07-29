'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Zap, AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/ui/EmptyState';
import { useAnalytics } from './AnalyticsProvider';
import type { Recommendation } from '@/lib/api';

const typeConfig: Record<Recommendation['type'], {
  icon: typeof TrendingUp;
  iconClass: string;
  bgClass: string;
  badgeClass: string;
  label: string;
}> = {
  increase: {
    icon: TrendingUp,
    iconClass: 'text-positive',
    bgClass: 'bg-positive/10 border-positive/20',
    badgeClass: 'bg-positive/15 text-positive',
    label: 'Scale Up',
  },
  decrease: {
    icon: TrendingDown,
    iconClass: 'text-negative',
    bgClass: 'bg-negative/10 border-negative/20',
    badgeClass: 'bg-negative/15 text-negative',
    label: 'Reduce Spend',
  },
  optimize: {
    icon: Zap,
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10 border-warning/20',
    badgeClass: 'bg-warning/15 text-warning',
    label: 'Optimize',
  },
  alert: {
    icon: AlertTriangle,
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10 border-warning/20',
    badgeClass: 'bg-warning/15 text-warning',
    label: 'Alert',
  },
};

const priorityColors: Record<Recommendation['priority'], string> = {
  high: 'text-negative',
  medium: 'text-warning',
  low: 'text-muted-foreground',
};

export default function AIRecommendationsPanel() {
  const { recommendations, loading, error } = useAnalytics();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleAction = (action: string) => {
    // Backend action-execution endpoint (auto-apply budget changes) is a future phase.
    toast.success(`Noted: ${action}`, {
      description: 'Review and apply this change directly in your ad platform for now.',
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`rec-skel-${i}`} className="h-16 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle size={24} />}
        title="Couldn't load recommendations"
        description={error}
      />
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={24} />}
        title="No recommendations yet"
        description="Upload campaign data — once there's enough signal, insights will show up here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const config = typeConfig[rec.type];
        const Icon = config.icon;
        const isExpanded = expanded === rec.id;

        return (
          <div
            key={rec.id}
            className={`rounded-xl border p-4 transition-all duration-200 ${config.bgClass}`}
          >
            <button
              className="flex w-full items-start gap-3 text-left"
              onClick={() => setExpanded(isExpanded ? null : rec.id)}
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-card/60">
                <Icon size={15} className={config.iconClass} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-2xs font-700 uppercase tracking-wider ${priorityColors[rec.priority]}`}>
                    {rec.priority} priority
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-2xs font-600 ${config.badgeClass}`}>
                    {config.label}
                  </span>
                  {rec.channel && (
                    <span className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-2xs text-muted-foreground">
                      {rec.channel}
                    </span>
                  )}
                </div>
                <p className="text-sm font-600 text-foreground leading-snug">{rec.headline}</p>
              </div>
              <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isExpanded && (
              <div className="mt-3 ml-11 animate-fade-in">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{rec.detail}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-lg border border-border bg-card/60 px-3 py-1.5">
                    <span className="text-2xs text-muted-foreground">Potential impact: </span>
                    <span className="text-xs font-600 text-positive font-mono">{rec.potential_impact}</span>
                  </div>
                  <button
                    onClick={() => handleAction(rec.action)}
                    className="flex items-center gap-1.5 rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-600 text-foreground transition-all duration-150 hover:bg-foreground/20 active:scale-95"
                  >
                    {rec.action}
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
