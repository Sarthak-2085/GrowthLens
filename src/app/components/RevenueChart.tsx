'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import EmptyState from '@/components/ui/EmptyState';
import { CalendarRange } from 'lucide-react';
import { useCampaigns } from './CampaignsProvider';

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const formatVal = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <p className="mb-2 text-xs font-600 text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-xs text-muted-foreground capitalize">{entry.name}:</span>
          <span className="text-xs font-600 font-mono text-foreground">
            {entry.name === 'conversions'
              ? entry.value.toLocaleString('en-IN')
              : formatVal(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueChart() {
  const { campaigns, loading } = useCampaigns();

  const trend = useMemo(() => {
    const byMonth = new Map<
      string,
      { revenue: number; spend: number; conversions: number; sortKey: string }
    >();
    for (const c of campaigns) {
      if (!c.start_date) continue;
      const d = new Date(c.start_date);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const entry = byMonth.get(sortKey) || { revenue: 0, spend: 0, conversions: 0, sortKey };
      entry.revenue += c.revenue;
      entry.spend += c.budget; // spend proxy — see metrics.ts note
      entry.conversions += c.conversions;
      (entry as any).month = label;
      byMonth.set(sortKey, entry);
    }
    return Array.from(byMonth.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map((e) => ({
        month: (e as any).month,
        revenue: e.revenue,
        spend: e.spend,
        conversions: e.conversions,
      }));
  }, [campaigns]);

  if (loading) return <div className="h-[280px] animate-pulse rounded-md bg-muted/60" />;

  if (trend.length < 2) {
    return (
      <EmptyState
        icon={<CalendarRange size={24} />}
        title="Not enough date spread yet"
        description="Add start dates across campaigns spanning more than one month to see a revenue trend."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}K`
          }
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)', paddingTop: '12px' }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#gradRevenue)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="spend"
          name="Budget"
          stroke="var(--accent)"
          strokeWidth={2}
          fill="url(#gradSpend)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
