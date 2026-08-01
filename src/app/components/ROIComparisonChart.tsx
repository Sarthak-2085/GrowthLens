'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import EmptyState from '@/components/ui/EmptyState';
import { TrendingUp } from 'lucide-react';
import { useCampaigns } from './CampaignsProvider';
import { computeROI, colorForChannel } from '@/lib/metrics';

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const roi = payload[0].value;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <p className="mb-1 text-xs font-600 text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        ROI:{' '}
        <span className={`font-mono font-700 ${roi >= 0 ? 'text-positive' : 'text-negative'}`}>
          {roi >= 0 ? '+' : ''}
          {roi}%
        </span>
      </p>
    </div>
  );
}

export default function ROIComparisonChart() {
  const { campaigns, loading } = useCampaigns();

  const roiData = useMemo(() => {
    const byChannel = new Map<string, { revenue: number; budget: number }>();
    for (const c of campaigns) {
      const entry = byChannel.get(c.channel) || { revenue: 0, budget: 0 };
      entry.revenue += c.revenue;
      entry.budget += c.budget;
      byChannel.set(c.channel, entry);
    }
    const channels = Array.from(byChannel.keys());
    return channels
      .map((channel) => {
        const { revenue, budget } = byChannel.get(channel)!;
        return {
          channel,
          roi: computeROI(revenue, budget),
          color: colorForChannel(channel, channels),
        };
      })
      .sort((a, b) => b.roi - a.roi);
  }, [campaigns]);

  if (loading) return <div className="h-[220px] animate-pulse rounded-md bg-muted/60" />;

  if (roiData.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp size={24} />}
        title="No data yet"
        description="Upload campaigns to compare ROI by channel."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={roiData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="channel"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1.5} />
        <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
          {roiData.map((entry, index) => (
            <Cell
              key={`roi-cell-${index}`}
              fill={entry.roi >= 0 ? entry.color : 'var(--negative)'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
