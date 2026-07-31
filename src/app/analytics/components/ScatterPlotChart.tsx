'use client';

import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { Campaign } from '@/lib/api';
import { computeROI, colorForChannel } from '@/lib/metrics';

interface ScatterPoint {
  id: number;
  name: string;
  channel: string;
  budget: number;
  roi: number;
  revenue: number;
  conversions: number;
  color: string;
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: ScatterPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card max-w-[220px]">
      <p className="mb-2 text-xs font-600 text-foreground leading-snug">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-mono font-600 text-foreground">₹{d.budget.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">ROI</span>
          <span className={`font-mono font-700 ${d.roi >= 0 ? 'text-positive' : 'text-negative'}`}>{d.roi >= 0 ? '+' : ''}{d.roi}%</span>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Revenue</span>
          <span className="font-mono font-600 text-foreground">₹{d.revenue.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Conversions</span>
          <span className="font-mono font-600 text-foreground">{d.conversions}</span>
        </div>
      </div>
    </div>
  );
}

export default function ScatterPlotChart({ campaigns }: { campaigns: Campaign[] }) {
  const scatterData = useMemo<ScatterPoint[]>(() => {
    const channels = Array.from(new Set(campaigns.map((c) => c.channel)));
    return campaigns.map((c) => ({
      id: c.id,
      name: c.campaign_name,
      channel: c.channel,
      budget: c.budget,
      roi: computeROI(c.revenue, c.budget),
      revenue: c.revenue,
      conversions: c.conversions,
      color: colorForChannel(c.channel, channels),
    }));
  }, [campaigns]);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          dataKey="budget"
          name="Budget"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}K`}
          label={{ value: 'Budget (₹)', position: 'insideBottom', offset: -8, fill: 'var(--muted-foreground)', fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="roi"
          name="ROI"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          width={52}
          label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', offset: 12, fill: 'var(--muted-foreground)', fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4 4" />
        <ReferenceLine y={100} stroke="var(--positive)" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
        <Scatter data={scatterData} r={8}>
          {scatterData.map((entry) => (
            <Cell key={`scatter-${entry.id}`} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
