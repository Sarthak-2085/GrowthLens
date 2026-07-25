'use client';

import React from 'react';
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
import { campaigns, computeROI, channelColors } from '@/lib/mockData';

const scatterData = campaigns.map((c) => ({
  id: c.id,
  name: c.name,
  channel: c.channel,
  spend: c.spend,
  roi: computeROI(c.revenue, c.spend),
  revenue: c.revenue,
  conversions: c.conversions,
  color: channelColors[c.channel] || 'var(--muted-foreground)',
}));

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: typeof scatterData[0] }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card max-w-[220px]">
      <p className="mb-2 text-xs font-600 text-foreground leading-snug">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Spend</span>
          <span className="font-mono font-600 text-foreground">₹{d.spend.toLocaleString('en-IN')}</span>
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

export default function ScatterPlotChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          dataKey="spend"
          name="Ad Spend"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}K`}
          label={{ value: 'Ad Spend (₹)', position: 'insideBottom', offset: -8, fill: 'var(--muted-foreground)', fontSize: 11 }}
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