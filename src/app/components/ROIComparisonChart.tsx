'use client';

import React from 'react';
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
import { channelBreakdown } from '@/lib/mockData';

const roiData = [...channelBreakdown]
  .sort((a, b) => b.roi - a.roi)
  .map((c) => ({ channel: c.channel, roi: c.roi, color: c.color }));

function CustomTooltip({ active, payload, label }: {
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
        ROI: <span className={`font-mono font-700 ${roi >= 0 ? 'text-positive' : 'text-negative'}`}>{roi >= 0 ? '+' : ''}{roi}%</span>
      </p>
    </div>
  );
}

export default function ROIComparisonChart() {
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