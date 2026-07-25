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
import { campaigns } from '@/lib/mockData';

const chartData = campaigns.map((c) => ({
  name: c.name.split('—')[0].trim().substring(0, 16) + (c.name.split('—')[0].trim().length > 16 ? '…' : ''),
  revenue: c.revenue,
  spend: c.spend,
  roi: parseFloat((((c.revenue - c.spend) / c.spend) * 100).toFixed(1)),
}));

const barColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-1)',
  'var(--chart-2)',
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <p className="mb-2 text-xs font-600 text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={`bar-tt-${entry.name}`} className="flex items-center gap-2 py-0.5">
          <span className="text-xs text-muted-foreground">{entry.name}:</span>
          <span className="text-xs font-600 font-mono text-foreground">
            {entry.name === 'ROI' ? `${entry.value}%` : `₹${entry.value.toLocaleString('en-IN')}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CampaignPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          angle={-30}
          textAnchor="end"
          dy={8}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}K`}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}