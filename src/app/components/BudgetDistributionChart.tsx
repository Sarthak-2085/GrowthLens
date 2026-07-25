'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import { channelBreakdown } from '@/lib/mockData';

const pieData = channelBreakdown.map((c) => ({
  name: c.channel,
  value: c.budget,
  color: c.color,
}));

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const total = pieData.reduce((s, d) => s + d.value, 0);
  const pct = ((payload[0].value / total) * 100).toFixed(1);
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: payload[0].payload.color }} />
        <span className="text-xs font-600 text-foreground">{payload[0].name}</span>
      </div>
      <p className="text-xs text-muted-foreground">Budget: <span className="font-mono font-600 text-foreground">₹{payload[0].value.toLocaleString('en-IN')}</span></p>
      <p className="text-xs text-muted-foreground">Share: <span className="font-600 text-foreground">{pct}%</span></p>
    </div>
  );
}

function renderActiveShape(props: {
  cx?: number; cy?: number; innerRadius?: number; outerRadius?: number;
  startAngle?: number; endAngle?: number; fill?: string; payload?: { name: string };
  value?: number;
}) {
  const {
    cx = 0, cy = 0, innerRadius = 0, outerRadius = 0,
    startAngle = 0, endAngle = 0, fill = '', payload, value = 0,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={600}>
        {payload?.name?.split(' ')[0]}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11}>
        ₹{(value / 1000).toFixed(0)}K
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

export default function BudgetDistributionChart() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {pieData.map((entry, index) => (
              <Cell key={`pie-cell-${entry.name}`} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 px-2">
        {pieData.map((entry) => (
          <div key={`legend-${entry.name}`} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="truncate text-xs text-muted-foreground">{entry.name}</span>
            <span className="ml-auto text-xs font-mono font-600 text-foreground">
              {((entry.value / pieData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}