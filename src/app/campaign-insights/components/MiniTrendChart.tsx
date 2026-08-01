'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface MiniTrendChartProps {
  data: { month: string; revenue: number }[];
  color: string;
}

export default function MiniTrendChart({ data, color }: MiniTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id={`miniGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 9, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 9, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#e5e7eb',
          }}
          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          labelStyle={{ color: '#9ca3af', marginBottom: 2 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={color}
          strokeWidth={2}
          fill={`url(#miniGrad-${color.replace('#', '')})`}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
