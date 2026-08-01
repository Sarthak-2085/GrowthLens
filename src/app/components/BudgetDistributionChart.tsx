'use client';

import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import EmptyState from '@/components/ui/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';
import { useCampaigns } from './CampaignsProvider';
import { colorForChannel } from '@/lib/metrics';

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string }; total: number }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { name, value, payload: p, total } = payload[0] as any;
  const pct = total ? ((value / total) * 100).toFixed(1) : '0.0';
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
        <span className="text-xs font-600 text-foreground">{name}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Budget:{' '}
        <span className="font-mono font-600 text-foreground">₹{value.toLocaleString('en-IN')}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Share: <span className="font-600 text-foreground">{pct}%</span>
      </p>
    </div>
  );
}

function renderActiveShape(props: any) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = '',
    payload,
    value = 0,
  } = props;
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="var(--foreground)"
        fontSize={13}
        fontWeight={600}
      >
        {payload?.name?.split(' ')[0]}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11}>
        ₹{(value / 1000).toFixed(0)}K
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
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
  const { campaigns, loading } = useCampaigns();
  const [activeIndex, setActiveIndex] = useState(0);

  const pieData = useMemo(() => {
    const byChannel = new Map<string, number>();
    for (const c of campaigns) {
      byChannel.set(c.channel, (byChannel.get(c.channel) || 0) + c.budget);
    }
    const channels = Array.from(byChannel.keys());
    const total = channels.reduce((s, ch) => s + (byChannel.get(ch) || 0), 0);
    return channels
      .map((name) => ({
        name,
        value: byChannel.get(name) || 0,
        color: colorForChannel(name, channels),
        total,
      }))
      .sort((a, b) => b.value - a.value);
  }, [campaigns]);

  if (loading) return <div className="h-[280px] animate-pulse rounded-md bg-muted/60" />;

  if (pieData.length === 0) {
    return (
      <EmptyState
        icon={<PieIcon size={24} />}
        title="No data yet"
        description="Upload campaigns to see budget by channel."
      />
    );
  }

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
            {pieData.map((entry) => (
              <Cell key={`pie-cell-${entry.name}`} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-1.5 px-2">
        {pieData.map((entry) => (
          <div key={`legend-${entry.name}`} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: entry.color }}
            />
            <span className="truncate text-xs text-muted-foreground">{entry.name}</span>
            <span className="ml-auto text-xs font-mono font-600 text-foreground">
              {entry.total ? ((entry.value / entry.total) * 100).toFixed(0) : '0'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
