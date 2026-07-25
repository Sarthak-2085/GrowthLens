import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import {
  Megaphone,
  IndianRupee,
  TrendingUp,
  MousePointerClick,
  Users,
  BarChart2,
} from 'lucide-react';
import { campaigns, computeROI, computeCTR, formatINR } from '@/lib/mockData';

// Compute aggregates from mock data
// Backend integration point: replace with GET /api/dashboard/kpis
const totalBudget = campaigns?.reduce((s, c) => s + c?.budget, 0);
const totalRevenue = campaigns?.reduce((s, c) => s + c?.revenue, 0);
const totalSpend = campaigns?.reduce((s, c) => s + c?.spend, 0);
const totalConversions = campaigns?.reduce((s, c) => s + c?.conversions, 0);
const totalClicks = campaigns?.reduce((s, c) => s + c?.clicks, 0);
const totalImpressions = campaigns?.reduce((s, c) => s + c?.impressions, 0);
const avgROI = computeROI(totalRevenue, totalSpend);
const avgCTR = computeCTR(totalClicks, totalImpressions);

export default function KPIBentoGrid() {
  return (
    // 6 cards → grid-cols-3 → row 1: hero (spans 2 cols) + 1 regular; row 2: 3 regular cards
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
      {/* Hero: Total Revenue — spans 1 col on mobile, highlighted treatment */}
      <div className="sm:col-span-2 lg:col-span-1">
        <MetricCard
          label="Total Revenue"
          value={formatINR(totalRevenue, true)}
          subValue={`from ₹${(totalSpend / 100000)?.toFixed(1)}L spend`}
          trend={18.4}
          trendLabel="vs last period"
          icon={<IndianRupee size={20} />}
          variant="positive"
          size="hero"
          description="Total attributed revenue across all 8 active and completed campaigns"
        />
      </div>
      <MetricCard
        label="Average ROI"
        value={`${avgROI}%`}
        subValue="blended across all channels"
        trend={12.1}
        trendLabel="vs last period"
        icon={<TrendingUp size={20} />}
        variant="default"
      />
      <MetricCard
        label="Total Budget"
        value={formatINR(totalBudget, true)}
        subValue={`${formatINR(totalSpend, true)} utilized`}
        icon={<BarChart2 size={20} />}
        variant="accent"
      />
      <MetricCard
        label="Total Campaigns"
        value="8"
        subValue="4 active · 2 completed · 1 paused · 1 draft"
        icon={<Megaphone size={20} />}
        variant="default"
      />
      <MetricCard
        label="Total Conversions"
        value={totalConversions?.toLocaleString('en-IN')}
        subValue="across all campaigns"
        trend={-4.2}
        trendLabel="vs last period"
        icon={<Users size={20} />}
        variant="warning"
      />
      <MetricCard
        label="Average CTR"
        value={`${avgCTR}%`}
        subValue={`${totalClicks?.toLocaleString('en-IN')} total clicks`}
        trend={6.8}
        trendLabel="vs last period"
        icon={<MousePointerClick size={20} />}
        variant="default"
      />
    </div>
  );
}