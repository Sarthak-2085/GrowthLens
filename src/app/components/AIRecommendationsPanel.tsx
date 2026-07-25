'use client';

import React, { useState } from 'react';
import { aiRecommendations } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Zap, AlertTriangle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


const typeConfig = {
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

const priorityColors = {
  high: 'text-negative',
  medium: 'text-warning',
  low: 'text-muted-foreground',
};

export default function AIRecommendationsPanel() {
  const [expanded, setExpanded] = useState<string | null>('rec-001');

  const handleAction = (recId: string, action: string) => {
    // Backend integration point: POST /api/recommendations/{recId}/action
    toast.success(`Action queued: ${action}`, {
      description: 'Your budget change will be reflected in the next sync.',
    });
  };

  return (
    <div className="space-y-3">
      {aiRecommendations.map((rec) => {
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
              <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-card/60`}>
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
                    <span className="text-xs font-600 text-positive font-mono">{rec.potentialImpact}</span>
                  </div>
                  <button
                    onClick={() => handleAction(rec.id, rec.action)}
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