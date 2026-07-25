// Backend integration point: replace these static arrays with API calls to
// GET /api/campaigns, GET /api/analytics, GET /api/recommendations

export interface Campaign {
  id: string;
  name: string;
  channel: 'Google Ads' | 'Meta Ads' | 'Instagram' | 'Email' | 'YouTube' | 'LinkedIn';
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;       // INR
  spend: number;        // INR actual spend
  revenue: number;      // INR attributed revenue
  clicks: number;
  impressions: number;
  conversions: number;
  startDate: string;    // ISO date string
  endDate: string;
}

export const campaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Diwali Sale — Google Search',
    channel: 'Google Ads',
    status: 'completed',
    budget: 180000,
    spend: 174500,
    revenue: 682000,
    clicks: 14820,
    impressions: 312400,
    conversions: 892,
    startDate: '2025-10-15',
    endDate: '2025-11-05',
  },
  {
    id: 'camp-002',
    name: 'Brand Awareness — Meta Reels',
    channel: 'Meta Ads',
    status: 'active',
    budget: 95000,
    spend: 61200,
    revenue: 198400,
    clicks: 22100,
    impressions: 890000,
    conversions: 412,
    startDate: '2025-12-01',
    endDate: '2026-01-31',
  },
  {
    id: 'camp-003',
    name: 'New Year Offers — Instagram Stories',
    channel: 'Instagram',
    status: 'active',
    budget: 72000,
    spend: 48300,
    revenue: 156800,
    clicks: 18450,
    impressions: 540000,
    conversions: 318,
    startDate: '2025-12-20',
    endDate: '2026-01-15',
  },
  {
    id: 'camp-004',
    name: 'Re-engagement — Email Drip',
    channel: 'Email',
    status: 'active',
    budget: 18000,
    spend: 12400,
    revenue: 94200,
    clicks: 8640,
    impressions: 62000,
    conversions: 284,
    startDate: '2025-11-10',
    endDate: '2026-02-28',
  },
  {
    id: 'camp-005',
    name: 'Product Demo — YouTube PreRoll',
    channel: 'YouTube',
    status: 'paused',
    budget: 60000,
    spend: 42800,
    revenue: 58200,
    clicks: 5820,
    impressions: 420000,
    conversions: 89,
    startDate: '2025-11-01',
    endDate: '2026-01-31',
  },
  {
    id: 'camp-006',
    name: 'B2B Lead Gen — LinkedIn',
    channel: 'LinkedIn',
    status: 'active',
    budget: 120000,
    spend: 88600,
    revenue: 142000,
    clicks: 3210,
    impressions: 98000,
    conversions: 64,
    startDate: '2025-10-01',
    endDate: '2026-03-31',
  },
  {
    id: 'camp-007',
    name: 'Retargeting — Google Display',
    channel: 'Google Ads',
    status: 'active',
    budget: 45000,
    spend: 38200,
    revenue: 172600,
    clicks: 9800,
    impressions: 480000,
    conversions: 412,
    startDate: '2025-12-10',
    endDate: '2026-02-28',
  },
  {
    id: 'camp-008',
    name: 'Flash Sale — Meta Carousel',
    channel: 'Meta Ads',
    status: 'completed',
    budget: 55000,
    spend: 54100,
    revenue: 68400,
    clicks: 7420,
    impressions: 210000,
    conversions: 118,
    startDate: '2025-09-15',
    endDate: '2025-09-30',
  },
];

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  spend: number;
  conversions: number;
}

export const revenueTrend: RevenueTrendPoint[] = [
  { month: 'Aug 25', revenue: 284000, spend: 118000, conversions: 412 },
  { month: 'Sep 25', revenue: 318000, spend: 132000, conversions: 488 },
  { month: 'Oct 25', revenue: 492000, spend: 168000, conversions: 712 },
  { month: 'Nov 25', revenue: 724000, spend: 214000, conversions: 1082 },
  { month: 'Dec 25', revenue: 618000, spend: 186000, conversions: 894 },
  { month: 'Jan 26', revenue: 542000, spend: 158000, conversions: 748 },
  { month: 'Feb 26', revenue: 396000, spend: 124000, conversions: 562 },
  { month: 'Mar 26', revenue: 448000, spend: 138000, conversions: 634 },
];

export interface ChannelBreakdown {
  channel: string;
  budget: number;
  revenue: number;
  roi: number;
  conversions: number;
  color: string;
}

export const channelBreakdown: ChannelBreakdown[] = [
  { channel: 'Google Ads', budget: 225000, revenue: 854600, roi: 279.8, conversions: 1304, color: '#8b5cf6' },
  { channel: 'Meta Ads', budget: 150000, revenue: 266800, roi: 77.9, conversions: 530, color: '#06b6d4' },
  { channel: 'Instagram', budget: 72000, revenue: 156800, roi: 117.8, conversions: 318, color: '#ec4899' },
  { channel: 'Email', budget: 18000, revenue: 94200, roi: 423.3, conversions: 284, color: '#22c55e' },
  { channel: 'YouTube', budget: 60000, revenue: 58200, roi: -3.0, conversions: 89, color: '#ef4444' },
  { channel: 'LinkedIn', budget: 120000, revenue: 142000, roi: 18.3, conversions: 64, color: '#f59e0b' },
];

export interface AIRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  type: 'increase' | 'decrease' | 'optimize' | 'alert';
  campaign?: string;
  channel?: string;
  headline: string;
  detail: string;
  potentialImpact: string;
  action: string;
}

export const aiRecommendations: AIRecommendation[] = [
  {
    id: 'rec-001',
    priority: 'high',
    type: 'increase',
    campaign: 'Re-engagement — Email Drip',
    channel: 'Email',
    headline: 'Scale Email budget — 423% ROI is exceptional',
    detail: 'Your Email Drip campaign is generating ₹94,200 revenue on just ₹18,000 spend. This is your highest-ROI channel by a significant margin. Increasing budget to ₹45,000 could yield an estimated ₹2.3L in additional revenue.',
    potentialImpact: '+₹2,30,000 estimated revenue',
    action: 'Increase Budget',
  },
  {
    id: 'rec-002',
    priority: 'high',
    type: 'decrease',
    campaign: 'Product Demo — YouTube PreRoll',
    channel: 'YouTube',
    headline: 'Pause or restructure YouTube — negative ROI (-3%)',
    detail: 'The YouTube PreRoll campaign has spent ₹42,800 but only generated ₹58,200 in revenue with just 89 conversions. CPA of ₹481 is 3.4× higher than your Email channel. Reallocating this budget to Google Retargeting could improve overall ROI by 18%.',
    potentialImpact: 'Save ₹17,200 in wasted spend',
    action: 'Pause Campaign',
  },
  {
    id: 'rec-003',
    priority: 'medium',
    type: 'optimize',
    campaign: 'Brand Awareness — Meta Reels',
    channel: 'Meta Ads',
    headline: 'Meta CTR is strong — but landing page needs work',
    detail: 'Meta Reels has a 2.48% CTR (above industry average) but your conversion rate is only 1.86%. High clicks with low conversions typically indicates landing page friction. A/B test your CTA placement and reduce form fields to improve conversion by an estimated 0.8–1.2%.',
    potentialImpact: '+₹42,000 revenue without extra spend',
    action: 'Optimize Landing Page',
  },
  {
    id: 'rec-004',
    priority: 'high',
    type: 'increase',
    campaign: 'Retargeting — Google Display',
    channel: 'Google Ads',
    headline: 'Google Retargeting ROI at 352% — underfunded',
    detail: 'Your retargeting campaign is converting at 4.2% with a CPA of ₹92.7 — your best CPA across all paid channels. Current budget of ₹45,000 is far below optimal. Recommend scaling to ₹90,000 to capture warm audience before they convert via competitors.',
    potentialImpact: '+₹1,72,600 estimated revenue',
    action: 'Double Budget',
  },
  {
    id: 'rec-005',
    priority: 'medium',
    type: 'alert',
    campaign: 'B2B Lead Gen — LinkedIn',
    channel: 'LinkedIn',
    headline: 'LinkedIn CPA of ₹1,384 is unsustainable for volume',
    detail: 'LinkedIn drives quality B2B leads but the cost per acquisition is 15× higher than Email. For your current stage, recommend capping LinkedIn at ₹60,000/month and reallocating the remaining ₹60,000 to Google Search where ROI is proven.',
    potentialImpact: 'Reallocate ₹60,000 to higher-ROI channels',
    action: 'Review Budget Cap',
  },
];

// Utility functions
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

export const channelColors: Record<string, string> = {
  'Google Ads': '#8b5cf6',
  'Meta Ads': '#06b6d4',
  'Instagram': '#ec4899',
  'Email': '#22c55e',
  'YouTube': '#ef4444',
  'LinkedIn': '#f59e0b',
};