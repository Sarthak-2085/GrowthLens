import React from 'react';

type StatusType =
  'active' | 'paused' | 'completed' | 'draft' | 'archived' | 'high' | 'medium' | 'low' | 'critical';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'default';
}

const statusConfig: Record<StatusType, { label: string; className: string; dot: string }> = {
  active: {
    label: 'Active',
    className: 'bg-positive/15 text-positive border border-positive/25',
    dot: 'bg-positive',
  },
  paused: {
    label: 'Paused',
    className: 'bg-warning/15 text-warning border border-warning/25',
    dot: 'bg-warning',
  },
  completed: {
    label: 'Completed',
    className: 'bg-accent/15 text-accent border border-accent/25',
    dot: 'bg-accent',
  },
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border border-border',
    dot: 'bg-muted-foreground',
  },
  archived: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground border border-border',
    dot: 'bg-muted-foreground',
  },
  high: {
    label: 'High',
    className: 'bg-positive/15 text-positive border border-positive/25',
    dot: 'bg-positive',
  },
  medium: {
    label: 'Medium',
    className: 'bg-warning/15 text-warning border border-warning/25',
    dot: 'bg-warning',
  },
  low: {
    label: 'Low',
    className: 'bg-negative/15 text-negative border border-negative/25',
    dot: 'bg-negative',
  },
  critical: {
    label: 'Critical',
    className: 'bg-negative/15 text-negative border border-negative/25',
    dot: 'bg-negative animate-pulse',
  },
};

export default function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-600
        ${config.className}
        ${size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs'}
      `}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
