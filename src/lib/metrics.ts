// Metric helpers for real (backend) campaign data.
// Note: the backend doesn't track a separate "spend" field yet — budget is
// used as the spend proxy for ROI/CPC/CPA until that's added.

export function formatINR(value: number, compact = false): string {
  if (compact) {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function computeCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return parseFloat(((clicks / impressions) * 100).toFixed(2));
}

export function computeROI(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return parseFloat((((revenue - spend) / spend) * 100).toFixed(1));
}

export function computeCVR(conversions: number, clicks: number): number {
  if (clicks === 0) return 0;
  return parseFloat(((conversions / clicks) * 100).toFixed(2));
}

export function computeCPC(spend: number, clicks: number): number {
  if (clicks === 0) return 0;
  return parseFloat((spend / clicks).toFixed(2));
}

export function computeCPA(spend: number, conversions: number): number {
  if (conversions === 0) return 0;
  return parseFloat((spend / conversions).toFixed(2));
}

// Fixed palette with stable fallback so a given channel name always renders
// the same color across charts in one session.
const CHANNEL_PALETTE = [
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#22c55e',
  '#ef4444',
  '#f59e0b',
  '#3b82f6',
  '#a3e635',
];

export function colorForChannel(channel: string, knownChannels: string[]): string {
  const idx = knownChannels.indexOf(channel);
  return CHANNEL_PALETTE[(idx >= 0 ? idx : 0) % CHANNEL_PALETTE.length];
}
