'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { campaigns, aiRecommendations, revenueTrend, computeROI, computeCTR, computeCVR, computeCPC, computeCPA, formatINR, channelColors, type Campaign, type AIRecommendation,  } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

import {
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target,
  DollarSign,
  MousePointerClick,
  Users,
  BarChart2,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

const MiniTrendChart = dynamic(() => import('./MiniTrendChart'), {
  ssr: false,
  loading: () => <div className="h-16 w-full animate-pulse rounded bg-muted/30" />,
});

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

interface EnrichedCampaign extends Campaign {
  roi: number;
  ctr: number;
  cvr: number;
  cpc: number;
  cpa: number;
}

function getHealthScore(c: EnrichedCampaign): { score: number; label: string; color: string } {
  let score = 0;
  if (c.roi > 200) score += 40;
  else if (c.roi > 50) score += 25;
  else if (c.roi > 0) score += 10;
  if (c.ctr > 3) score += 20;
  else if (c.ctr > 1.5) score += 12;
  else if (c.ctr > 0.5) score += 6;
  if (c.cvr > 3) score += 20;
  else if (c.cvr > 1.5) score += 12;
  else if (c.cvr > 0.5) score += 6;
  if (c.conversions > 300) score += 20;
  else if (c.conversions > 100) score += 12;
  else if (c.conversions > 30) score += 6;
  if (c.status === 'active') score += 10;
  else if (c.status === 'completed') score += 5;

  const clamped = Math.min(100, score);
  if (clamped >= 75) return { score: clamped, label: 'Excellent', color: 'text-positive' };
  if (clamped >= 50) return { score: clamped, label: 'Good', color: 'text-primary' };
  if (clamped >= 30) return { score: clamped, label: 'Fair', color: 'text-warning' };
  return { score: clamped, label: 'Poor', color: 'text-negative' };
}

function getRecsForCampaign(campaign: Campaign): AIRecommendation[] {
  return aiRecommendations.filter(
    (r) => r.campaign === campaign.name || r.channel === campaign.channel
  );
}

export default function CampaignInsightsClient() {
  const [selectedId, setSelectedId] = useState<string>(campaigns[0].id);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const enriched = useMemo<EnrichedCampaign[]>(() =>
    campaigns.map((c) => ({
      ...c,
      roi: computeROI(c.revenue, c.spend),
      ctr: computeCTR(c.clicks, c.impressions),
      cvr: computeCVR(c.conversions, c.clicks),
      cpc: computeCPC(c.spend, c.clicks),
      cpa: computeCPA(c.spend, c.conversions),
    })),
    []
  );

  const selected = useMemo(
    () => enriched.find((c) => c.id === selectedId) ?? enriched[0],
    [enriched, selectedId]
  );

  const health = getHealthScore(selected);
  const recs = getRecsForCampaign(selected);
  const budgetUtilization = selected.budget > 0 ? (selected.spend / selected.budget) * 100 : 0;
  const channelColor = channelColors[selected.channel] ?? '#8b5cf6';

  // Trend data for mini chart (simulated per-campaign)
  const trendData = useMemo(() => {
    const base = selected.revenue / 8;
    return revenueTrend.map((pt, i) => ({
      month: pt.month,
      revenue: Math.round(base * (0.6 + Math.random() * 0.8 + i * 0.05)),
    }));
  }, [selected.id]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground tracking-tight">Campaign Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deep per-campaign breakdowns with AI-powered recommendations
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-600 text-primary">AI Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Campaign Selector List */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-2xs font-600 uppercase tracking-widest text-muted-foreground px-1 mb-3">
            Select Campaign
          </p>
          {enriched.map((c) => {
            const h = getHealthScore(c);
            const isActive = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setExpandedRec(null); }}
                className={`w-full rounded-xl border p-3.5 text-left transition-all duration-150 ${
                  isActive
                    ? 'border-primary/40 bg-primary/8 shadow-sm'
                    : 'border-border bg-card/40 hover:bg-card/70 hover:border-border/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-600 text-foreground leading-snug line-clamp-2">{c.name}</p>
                  <span
                    className="flex-shrink-0 h-2 w-2 rounded-full mt-1"
                    style={{ background: channelColors[c.channel] }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-muted-foreground">{c.channel}</span>
                  <span className={`text-2xs font-700 ${h.color}`}>{h.label}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${h.score}%`, background: channelColors[c.channel] }}
                    />
                  </div>
                  <span className="text-2xs font-mono text-muted-foreground">{h.score}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Detail Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Campaign Header Card */}
          <div className="card-glass p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${channelColor}20` }}
                >
                  <Layers size={20} style={{ color: channelColor }} />
                </div>
                <div>
                  <h2 className="text-base font-700 text-foreground leading-snug">{selected.name}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-2xs font-600"
                      style={{ background: `${channelColor}20`, color: channelColor }}
                    >
                      {selected.channel}
                    </span>
                    <StatusBadge status={selected.status} size="sm" />
                    <span className="text-2xs text-muted-foreground">
                      {selected.startDate} → {selected.endDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xs text-muted-foreground mb-0.5">Health Score</p>
                  <p className={`text-2xl font-800 font-mono tabular-nums ${health.color}`}>
                    {health.score}
                    <span className="text-sm font-500 text-muted-foreground">/100</span>
                  </p>
                  <p className={`text-xs font-600 ${health.color}`}>{health.label}</p>
                </div>
              </div>
            </div>

            {/* Budget utilization bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Budget Utilization</span>
                <span className="text-xs font-600 font-mono text-foreground">
                  {formatINR(selected.spend, true)} / {formatINR(selected.budget, true)}
                  <span className="ml-1.5 text-muted-foreground">({budgetUtilization.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, budgetUtilization)}%`,
                    background: budgetUtilization > 95 ? '#ef4444' : budgetUtilization > 80 ? '#f59e0b' : channelColor,
                  }}
                />
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {[
              { label: 'ROI', value: `${selected.roi > 0 ? '+' : ''}${selected.roi}%`, icon: TrendingUp, color: selected.roi > 0 ? 'text-positive' : 'text-negative', mono: true },
              { label: 'Revenue', value: formatINR(selected.revenue, true), icon: DollarSign, color: 'text-foreground', mono: true },
              { label: 'CTR', value: `${selected.ctr}%`, icon: MousePointerClick, color: 'text-primary', mono: true },
              { label: 'CVR', value: `${selected.cvr}%`, icon: Target, color: 'text-primary', mono: true },
              { label: 'CPC', value: `₹${selected.cpc}`, icon: BarChart2, color: 'text-foreground', mono: true },
              { label: 'CPA', value: `₹${selected.cpa}`, icon: Users, color: 'text-foreground', mono: true },
            ].map((kpi) => {
              const KpiIcon = kpi.icon;
              return (
                <div key={kpi.label} className="card-glass p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <KpiIcon size={12} className="text-muted-foreground" />
                    <span className="text-2xs text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                  </div>
                  <p className={`text-base font-700 font-mono tabular-nums ${kpi.color}`}>{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Stats + Mini Trend */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Detailed stats */}
            <div className="card-glass p-5">
              <h3 className="text-sm font-600 text-foreground mb-4 flex items-center gap-2">
                <Info size={14} className="text-muted-foreground" />
                Campaign Metrics
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Budget', value: formatINR(selected.budget), sub: 'allocated' },
                  { label: 'Actual Spend', value: formatINR(selected.spend), sub: `${budgetUtilization.toFixed(1)}% used` },
                  { label: 'Revenue Generated', value: formatINR(selected.revenue), sub: 'attributed' },
                  { label: 'Total Clicks', value: selected.clicks.toLocaleString('en-IN'), sub: `${selected.ctr}% CTR` },
                  { label: 'Impressions', value: selected.impressions.toLocaleString('en-IN'), sub: 'total served' },
                  { label: 'Conversions', value: selected.conversions.toLocaleString('en-IN'), sub: `${selected.cvr}% CVR` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <div className="text-right">
                      <span className="text-xs font-600 font-mono text-foreground">{row.value}</span>
                      <span className="ml-1.5 text-2xs text-muted-foreground/70">{row.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini trend chart */}
            <div className="card-glass p-5">
              <h3 className="text-sm font-600 text-foreground mb-1 flex items-center gap-2">
                <BarChart2 size={14} className="text-muted-foreground" />
                Revenue Trend
              </h3>
              <p className="text-2xs text-muted-foreground mb-4">Estimated monthly attribution</p>
              <MiniTrendChart data={trendData} color={channelColor} />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-2xs text-muted-foreground">Total Revenue</p>
                  <p className="text-sm font-700 font-mono text-positive">{formatINR(selected.revenue, true)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xs text-muted-foreground">Avg Monthly</p>
                  <p className="text-sm font-700 font-mono text-foreground">
                    {formatINR(Math.round(selected.revenue / 8), true)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Cards */}
          <div className="card-glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <Sparkles size={13} className="text-primary" />
              </div>
              <h3 className="text-sm font-600 text-foreground">AI Recommendations</h3>
              {recs.length > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-600 text-primary">
                  {recs.length} insight{recs.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {recs.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 px-5 py-8 text-center">
                <Zap size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No specific recommendations for this campaign.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Performance looks stable — keep monitoring.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recs.map((rec) => {
                  const config = typeConfig[rec.type];
                  const RecIcon = config.icon;
                  const isExpanded = expandedRec === rec.id;
                  return (
                    <div
                      key={rec.id}
                      className={`rounded-xl border p-4 transition-all duration-200 ${config.bgClass}`}
                    >
                      <button
                        className="flex w-full items-start gap-3 text-left"
                        onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                      >
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-card/60">
                          <RecIcon size={15} className={config.iconClass} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-2xs font-700 uppercase tracking-wider ${priorityColors[rec.priority]}`}>
                              {rec.priority} priority
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-2xs font-600 ${config.badgeClass}`}>
                              {config.label}
                            </span>
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
                            <button className="flex items-center gap-1.5 rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-600 text-foreground transition-all duration-150 hover:bg-foreground/20 active:scale-95">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
