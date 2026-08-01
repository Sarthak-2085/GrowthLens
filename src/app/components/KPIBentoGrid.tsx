'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import MetricCard from '@/components/ui/MetricCard';
import { KPICardSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
  Megaphone,
  IndianRupee,
  TrendingUp,
  MousePointerClick,
  Users,
  BarChart2,
  UploadCloud,
  AlertCircle,
  Crown,
  Gauge,
} from 'lucide-react';
import { useCampaigns } from './CampaignsProvider';
import { useAnalytics } from './AnalyticsProvider';
import { computeROI, computeCTR, formatINR } from '@/lib/metrics';

export default function KPIBentoGrid() {
  const { campaigns, loading, error } = useCampaigns();
  const { summary } = useAnalytics();

  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    // Spend isn't tracked separately yet — budget stands in as the spend figure.
    const avgROI = computeROI(totalRevenue, totalBudget);
    const avgCTR = computeCTR(totalClicks, totalImpressions);
    const activeCount = campaigns.filter((c) => c.status === 'active').length;
    const pausedCount = campaigns.filter((c) => c.status === 'paused').length;
    const completedCount = campaigns.filter((c) => c.status === 'completed').length;
    const draftCount = campaigns.filter((c) => c.status === 'draft').length;

    return {
      totalBudget,
      totalRevenue,
      totalConversions,
      totalClicks,
      avgROI,
      avgCTR,
      activeCount,
      pausedCount,
      completedCount,
      draftCount,
    };
  }, [campaigns]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <KPICardSkeleton key={`kpi-skel-${i}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-5">
        <EmptyState
          icon={<AlertCircle size={24} />}
          title="Couldn't load dashboard data"
          description={error}
        />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="card-glass p-5">
        <EmptyState
          icon={<UploadCloud size={24} />}
          title="No campaigns yet"
          description="Upload a CSV to see your KPIs, charts, and campaign table populate here."
          action={
            <Link
              href="/upload-data"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95"
            >
              Upload CSV
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
      <div className="sm:col-span-2 lg:col-span-1">
        <MetricCard
          label="Total Revenue"
          value={formatINR(stats.totalRevenue, true)}
          subValue={`from ${formatINR(stats.totalBudget, true)} budget`}
          icon={<IndianRupee size={20} />}
          variant="positive"
          size="hero"
          description={`Total attributed revenue across ${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`}
        />
      </div>
      <MetricCard
        label="Average ROI"
        value={`${stats.avgROI}%`}
        subValue="blended across all campaigns"
        icon={<TrendingUp size={20} />}
        variant="default"
      />
      <MetricCard
        label="Total Budget"
        value={formatINR(stats.totalBudget, true)}
        subValue="across uploaded campaigns"
        icon={<BarChart2 size={20} />}
        variant="accent"
      />
      <MetricCard
        label="Total Campaigns"
        value={String(campaigns.length)}
        subValue={`${stats.activeCount} active · ${stats.completedCount} completed · ${stats.pausedCount} paused · ${stats.draftCount} draft`}
        icon={<Megaphone size={20} />}
        variant="default"
      />
      <MetricCard
        label="Total Conversions"
        value={stats.totalConversions.toLocaleString('en-IN')}
        subValue="across all campaigns"
        icon={<Users size={20} />}
        variant="warning"
      />
      <MetricCard
        label="Average CTR"
        value={`${stats.avgCTR}%`}
        subValue={`${stats.totalClicks.toLocaleString('en-IN')} total clicks`}
        icon={<MousePointerClick size={20} />}
        variant="default"
      />
      {summary?.best_campaign && (
        <MetricCard
          label="Best Campaign"
          value={summary.best_campaign.campaign_name}
          subValue={`+${summary.best_campaign.roi}% ROI · ${summary.best_campaign.channel}`}
          icon={<Crown size={20} />}
          variant="positive"
        />
      )}
      {summary?.most_efficient_campaign && (
        <MetricCard
          label="Most Efficient"
          value={`${summary.most_efficient_campaign.budget_efficiency}x`}
          subValue={`${summary.most_efficient_campaign.campaign_name} · revenue per ₹ spent`}
          icon={<Gauge size={20} />}
          variant="accent"
        />
      )}
    </div>
  );
}
