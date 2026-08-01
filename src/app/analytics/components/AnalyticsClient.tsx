'use client';

import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCampaigns } from '../../components/CampaignsProvider';
import {
  computeROI,
  computeCTR,
  computeCVR,
  computeCPC,
  computeCPA,
  formatINR,
  colorForChannel,
} from '@/lib/metrics';
import type { Campaign } from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { ChartSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
  Trophy,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  BarChart3,
  ScatterChart,
  Activity,
  Search,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ScatterPlotChart = dynamic(() => import('./ScatterPlotChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={320} />,
});

const ChannelBreakdownChart = dynamic(() => import('./ChannelBreakdownChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={260} />,
});

const CTRCVRChart = dynamic(() => import('./CTRCVRChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={260} />,
});

type EnrichedCampaign = Campaign & {
  roi: number;
  ctr: number;
  cvr: number;
  cpc: number;
  cpa: number;
};
type SortField =
  | 'campaign_name'
  | 'channel'
  | 'budget'
  | 'revenue'
  | 'roi'
  | 'ctr'
  | 'cvr'
  | 'cpc'
  | 'cpa'
  | 'conversions'
  | 'status';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;
const MAX_CTR_CVR_CAMPAIGNS = 15; // cap for chart legibility, mirrors dashboard's chart caps

export default function AnalyticsClient() {
  const { campaigns, loading } = useCampaigns();

  const [channelFilter, setChannelFilter] = useState('All Channels');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('roi');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const knownChannels = useMemo(
    () => Array.from(new Set(campaigns.map((c) => c.channel))).sort(),
    [campaigns]
  );
  const ALL_CHANNELS = useMemo(() => ['All Channels', ...knownChannels], [knownChannels]);
  const ALL_STATUSES = ['All Status', 'active', 'paused', 'completed', 'draft'];

  const enrichedCampaigns = useMemo<EnrichedCampaign[]>(
    () =>
      campaigns.map((c) => ({
        ...c,
        roi: computeROI(c.revenue, c.budget),
        ctr: computeCTR(c.clicks, c.impressions),
        cvr: computeCVR(c.conversions, c.clicks),
        cpc: computeCPC(c.budget, c.clicks),
        cpa: computeCPA(c.budget, c.conversions),
      })),
    [campaigns]
  );

  // Filter + sort (page resets whenever the result set changes)
  const filteredCampaigns = useMemo(() => {
    let result = enrichedCampaigns;

    if (channelFilter !== 'All Channels') {
      result = result.filter((c) => c.channel === channelFilter);
    }
    if (statusFilter !== 'All Status') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.campaign_name.toLowerCase().includes(q) || c.channel.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      let aVal: string | number = a[sortField as keyof typeof a] as string | number;
      let bVal: string | number = b[sortField as keyof typeof b] as string | number;
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [enrichedCampaigns, channelFilter, statusFilter, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCampaigns = filteredCampaigns.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetToFirstPage = () => setPage(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    resetToFirstPage();
  };

  const bestCampaign = useMemo(
    () =>
      enrichedCampaigns.length ? [...enrichedCampaigns].sort((a, b) => b.roi - a.roi)[0] : null,
    [enrichedCampaigns]
  );
  const worstCampaign = useMemo(
    () =>
      enrichedCampaigns.length ? [...enrichedCampaigns].sort((a, b) => a.roi - b.roi)[0] : null,
    [enrichedCampaigns]
  );

  const channelBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { channel: string; budget: number; revenue: number; conversions: number }
    >();
    for (const c of campaigns) {
      const row = map.get(c.channel) || {
        channel: c.channel,
        budget: 0,
        revenue: 0,
        conversions: 0,
      };
      row.budget += c.budget;
      row.revenue += c.revenue;
      row.conversions += c.conversions;
      map.set(c.channel, row);
    }
    return Array.from(map.values())
      .map((row) => ({
        ...row,
        roi: computeROI(row.revenue, row.budget),
        color: colorForChannel(row.channel, knownChannels),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [campaigns, knownChannels]);

  const ctrCvrCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => b.revenue - a.revenue).slice(0, MAX_CTR_CVR_CAMPAIGNS),
    [campaigns]
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? (
      <ArrowUp size={12} className="text-primary" />
    ) : (
      <ArrowDown size={12} className="text-primary" />
    );
  };

  const totalBudget = filteredCampaigns.reduce((s, c) => s + c.budget, 0);
  const totalRevenue = filteredCampaigns.reduce((s, c) => s + c.revenue, 0);
  const totalConversions = filteredCampaigns.reduce((s, c) => s + c.conversions, 0);
  const blendedROI = computeROI(totalRevenue, totalBudget);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
          <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-700 text-foreground tracking-tight mb-1">
          Campaign Analytics
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Deep-dive metrics across your campaigns.
        </p>
        <div className="card-glass p-10">
          <EmptyState
            icon={<UploadCloud size={24} />}
            title="No campaigns yet"
            description="Upload a CSV to unlock the full analytics table, scatter plot, and channel breakdowns."
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
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground tracking-tight">Campaign Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deep-dive metrics across {campaigns.length} campaigns · {filteredCampaigns.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-card px-3 py-1.5">
            Total Budget:{' '}
            <span className="font-mono font-600 text-foreground">
              {formatINR(totalBudget, true)}
            </span>
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5">
            Total Revenue:{' '}
            <span className="font-mono font-600 text-positive">
              {formatINR(totalRevenue, true)}
            </span>
          </span>
        </div>
      </div>

      {/* Best / Worst Spotlight */}
      {bestCampaign && worstCampaign && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
          <div className="card-glass card-glow-positive p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-positive/15">
                <Trophy size={18} className="text-positive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-600 uppercase tracking-widest text-positive mb-1">
                  Best Campaign · Highest ROI
                </p>
                <p
                  className="text-sm font-600 text-foreground truncate mb-2"
                  title={bestCampaign.campaign_name}
                >
                  {bestCampaign.campaign_name}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-2xs text-muted-foreground">ROI</span>
                    <p className="text-lg font-700 font-mono text-positive tabular-nums">
                      +{bestCampaign.roi}%
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs text-muted-foreground">Revenue</span>
                    <p className="text-sm font-600 font-mono text-foreground tabular-nums">
                      {formatINR(bestCampaign.revenue, true)}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs text-muted-foreground">Budget</span>
                    <p className="text-sm font-600 font-mono text-foreground tabular-nums">
                      {formatINR(bestCampaign.budget, true)}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs text-muted-foreground">CPA</span>
                    <p className="text-sm font-600 font-mono text-foreground tabular-nums">
                      ₹{bestCampaign.cpa}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: colorForChannel(bestCampaign.channel, knownChannels) }}
                  />
                  <span className="text-xs text-muted-foreground">{bestCampaign.channel}</span>
                  <StatusBadge status={bestCampaign.status} size="sm" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  This campaign has the highest return on ad spend. Consider increasing its budget
                  allocation to capture more volume at this efficiency.
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass card-glow-negative p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-negative/15">
                <TrendingDown size={18} className="text-negative" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-600 uppercase tracking-widest text-negative mb-1">
                  Worst Campaign · Lowest ROI
                </p>
                <p
                  className="text-sm font-600 text-foreground truncate mb-2"
                  title={worstCampaign.campaign_name}
                >
                  {worstCampaign.campaign_name}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-2xs text-muted-foreground">ROI</span>
                    <p className="text-lg font-700 font-mono text-negative tabular-nums">
                      {worstCampaign.roi}%
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs text-muted-foreground">Revenue</span>
                    <p className="text-sm font-600 font-mono text-foreground tabular-nums">
                      {formatINR(worstCampaign.revenue, true)}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs text-muted-foreground">Budget</span>
                    <p className="text-sm font-600 font-mono text-foreground tabular-nums">
                      {formatINR(worstCampaign.budget, true)}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs text-muted-foreground">CPA</span>
                    <p className="text-sm font-600 font-mono text-foreground tabular-nums">
                      ₹{worstCampaign.cpa}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: colorForChannel(worstCampaign.channel, knownChannels) }}
                  />
                  <span className="text-xs text-muted-foreground">{worstCampaign.channel}</span>
                  <StatusBadge status={worstCampaign.status} size="sm" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  This campaign is generating negative or minimal returns. Audit creative assets and
                  landing page quality, or reallocate budget to higher-performing channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
        <div className="card-glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <ScatterChart size={15} className="text-muted-foreground" />
            <div>
              <h2 className="text-base font-600 text-foreground">Budget vs ROI</h2>
              <p className="text-xs text-muted-foreground">
                Each bubble = one campaign. Dashed line = breakeven
              </p>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {knownChannels.map((ch) => (
              <div key={`scatter-legend-${ch}`} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: colorForChannel(ch, knownChannels) }}
                />
                <span className="text-2xs text-muted-foreground">{ch}</span>
              </div>
            ))}
          </div>
          <ScatterPlotChart campaigns={campaigns} />
        </div>

        <div className="card-glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-muted-foreground" />
            <div>
              <h2 className="text-base font-600 text-foreground">Revenue by Channel</h2>
              <p className="text-xs text-muted-foreground">
                Total attributed revenue per marketing channel
              </p>
            </div>
          </div>
          <ChannelBreakdownChart data={channelBreakdown} />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
            {channelBreakdown.slice(0, 3).map((ch) => (
              <div
                key={`ch-summary-${ch.channel}`}
                className="rounded-lg bg-muted/30 px-2.5 py-2 text-center"
              >
                <p className="text-2xs text-muted-foreground truncate">
                  {ch.channel.split(' ')[0]}
                </p>
                <p
                  className={`text-xs font-700 font-mono tabular-nums ${ch.roi >= 100 ? 'text-positive' : ch.roi >= 0 ? 'text-warning' : 'text-negative'}`}
                >
                  {ch.roi >= 0 ? '+' : ''}
                  {ch.roi}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card-glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={15} className="text-muted-foreground" />
            <div>
              <h2 className="text-base font-600 text-foreground">
                CTR vs Conversion Rate by Campaign
              </h2>
              <p className="text-xs text-muted-foreground">
                High CTR + low CVR indicates landing page friction
                {campaigns.length > MAX_CTR_CVR_CAMPAIGNS
                  ? ` · top ${MAX_CTR_CVR_CAMPAIGNS} by revenue shown`
                  : ''}
              </p>
            </div>
          </div>
          <CTRCVRChart campaigns={ctrCvrCampaigns} />
        </div>
      </div>

      {/* Filters + Table */}
      <div className="card-glass overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative flex-1 min-w-[180px] max-w-[280px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search campaigns…"
              aria-label="Search campaigns by name or channel"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              className="w-full rounded-lg border border-border bg-input pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-muted-foreground" />
            <select
              value={channelFilter}
              aria-label="Filter by channel"
              onChange={(e) => {
                setChannelFilter(e.target.value);
                resetToFirstPage();
              }}
              className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            >
              {ALL_CHANNELS.map((ch) => (
                <option key={`filter-ch-${ch}`} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            aria-label="Filter by status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              resetToFirstPage();
            }}
            className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          >
            {ALL_STATUSES.map((s) => (
              <option key={`filter-st-${s}`} value={s}>
                {s === 'All Status' ? s : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <div className="ml-auto text-xs text-muted-foreground">
            {filteredCampaigns.length} of {campaigns.length} campaigns
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr>
                {(
                  [
                    { field: 'campaign_name', label: 'Campaign', align: 'left' },
                    { field: 'channel', label: 'Channel', align: 'left' },
                    { field: 'status', label: 'Status', align: 'left' },
                    { field: 'budget', label: 'Budget', align: 'right' },
                    { field: 'revenue', label: 'Revenue', align: 'right' },
                    { field: 'roi', label: 'ROI', align: 'right' },
                    { field: 'ctr', label: 'CTR', align: 'right' },
                    { field: 'cvr', label: 'CVR', align: 'right' },
                    { field: 'cpc', label: 'CPC', align: 'right' },
                    { field: 'cpa', label: 'CPA', align: 'right' },
                    { field: 'conversions', label: 'Conv.', align: 'right' },
                  ] as { field: SortField; label: string; align: string }[]
                ).map((col) => (
                  <th
                    key={`th-${col.field}`}
                    onClick={() => handleSort(col.field)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(col.field);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-sort={
                      sortField === col.field
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className={`
                      cursor-pointer select-none px-4 py-3
                      text-xs font-600 uppercase tracking-wider text-muted-foreground
                      transition-colors hover:text-foreground
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2
                      ${col.align === 'right' ? 'text-right' : 'text-left'}
                    `}
                  >
                    <div
                      className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}
                    >
                      {col.label}
                      <SortIcon field={col.field} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {pagedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-sm text-muted-foreground">
                    No campaigns match your current filters. Try adjusting the search, channel, or
                    status filter.
                  </td>
                </tr>
              ) : (
                pagedCampaigns.map((c) => (
                  <tr key={c.id} className="group transition-colors hover:bg-white/3">
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <p className="font-500 text-foreground truncate" title={c.campaign_name}>
                        {c.campaign_name}
                      </p>
                      {c.start_date && (
                        <p className="text-2xs text-muted-foreground mt-0.5">{c.start_date}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: colorForChannel(c.channel, knownChannels) }}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {c.channel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {formatINR(c.budget, true)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-xs font-600 text-foreground tabular-nums">
                        {formatINR(c.revenue, true)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`font-mono text-xs font-700 tabular-nums ${
                          c.roi >= 100
                            ? 'text-positive'
                            : c.roi >= 0
                              ? 'text-warning'
                              : 'text-negative'
                        }`}
                      >
                        {c.roi >= 0 ? '+' : ''}
                        {c.roi}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-xs text-foreground tabular-nums">
                        {c.ctr}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-xs text-foreground tabular-nums">
                        {c.cvr}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-xs text-foreground tabular-nums">
                        ₹{c.cpc}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`font-mono text-xs font-600 tabular-nums ${
                          c.cpa < 200
                            ? 'text-positive'
                            : c.cpa < 600
                              ? 'text-warning'
                              : 'text-negative'
                        }`}
                      >
                        ₹{c.cpa}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-xs font-600 text-foreground tabular-nums">
                        {c.conversions.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCampaigns.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
            <span className="text-xs text-muted-foreground">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredCampaigns.length)} of{' '}
              {filteredCampaigns.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-500 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Prev
              </button>
              <span className="px-2 text-xs text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-500 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Filtered-set summary */}
        {filteredCampaigns.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
            <span>
              Total Conversions:{' '}
              <span className="font-mono font-600 text-foreground">
                {totalConversions.toLocaleString('en-IN')}
              </span>
            </span>
            <span>
              Total Revenue:{' '}
              <span className="font-mono font-600 text-positive">
                {formatINR(totalRevenue, true)}
              </span>
            </span>
            <span>
              Total Budget:{' '}
              <span className="font-mono font-600 text-foreground">
                {formatINR(totalBudget, true)}
              </span>
            </span>
            <span className="ml-auto">
              Blended ROI:{' '}
              <span
                className={`font-mono font-700 ${blendedROI >= 0 ? 'text-positive' : 'text-negative'}`}
              >
                {blendedROI >= 0 ? '+' : ''}
                {blendedROI}%
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
