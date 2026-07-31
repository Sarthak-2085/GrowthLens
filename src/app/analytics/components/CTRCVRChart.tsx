'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Campaign } from '@/lib/api';
import { computeCTR, computeCVR } from '@/lib/metrics';

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <p className="mb-2 text-xs font-600 text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={`ctr-tt-${entry.name}`} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-muted-foreground">{entry.name}:</span>
            <span className="text-xs font-600 font-mono text-foreground">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function CTRCVRChart({ campaigns }: { campaigns: Campaign[] }) {
  const ctrCvrData = useMemo(
    () =>
      campaigns.map((c) => ({
        name: c.campaign_name.length > 14 ? `${c.campaign_name.slice(0, 14)}…` : c.campaign_name,
        ctr: computeCTR(c.clicks, c.impressions),
        cvr: computeCVR(c.conversions, c.clicks),
      })),
    [campaigns]
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={ctrCvrData} margin={{ top: 8, right: 16, bottom: 40, left: 0 }}>
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
          tickFormatter={(v) => `${v}%`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)', paddingTop: '12px' }}
        />
        <Line
          type="monotone"
          dataKey="ctr"
          name="CTR"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="cvr"
          name="CVR"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
