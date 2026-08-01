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
} from 'recharts';

export interface ChannelBreakdownRow {
  channel: string;
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  color: string;
}

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
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <p className="mb-2 text-xs font-600 text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={`ch-tt-${entry.name}`} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-muted-foreground">{entry.name}:</span>
          <span className="text-xs font-600 font-mono text-foreground">
            {entry.name === 'ROI' ? `${entry.value}%` : `₹${entry.value.toLocaleString('en-IN')}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ChannelBreakdownChart({ data }: { data: ChannelBreakdownRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barSize={18}
        barCategoryGap="25%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}K`
          }
        />
        <YAxis
          type="category"
          dataKey="channel"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={88}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`ch-bar-${index}`} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
