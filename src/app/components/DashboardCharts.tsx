'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';

const RevenueChart = dynamic(() => import('./RevenueChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={280} />,
});

const CampaignPerformanceChart = dynamic(() => import('./CampaignPerformanceChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={280} />,
});

const BudgetDistributionChart = dynamic(() => import('./BudgetDistributionChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={280} />,
});

const ROIComparisonChart = dynamic(() => import('./ROIComparisonChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={220} />,
});

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
      {/* Revenue Trend — full width */}
      <div className="lg:col-span-2 card-glass p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-600 text-foreground">Revenue & Spend Trend</h2>
            <p className="text-xs text-muted-foreground">
              Monthly revenue vs ad spend — Aug 2025 to Mar 2026
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-primary opacity-80" />
              Revenue
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-accent opacity-80" />
              Spend
            </div>
          </div>
        </div>
        <RevenueChart />
      </div>

      {/* Campaign Performance */}
      <div className="card-glass p-5">
        <div className="mb-4">
          <h2 className="text-base font-600 text-foreground">Campaign Revenue</h2>
          <p className="text-xs text-muted-foreground">Attributed revenue by campaign</p>
        </div>
        <CampaignPerformanceChart />
      </div>

      {/* Budget Distribution + ROI Comparison side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card-glass p-5">
          <div className="mb-4">
            <h2 className="text-base font-600 text-foreground">Budget Distribution</h2>
            <p className="text-xs text-muted-foreground">Spend share by channel</p>
          </div>
          <BudgetDistributionChart />
        </div>

        <div className="card-glass p-5">
          <div className="mb-4">
            <h2 className="text-base font-600 text-foreground">ROI by Channel</h2>
            <p className="text-xs text-muted-foreground">Return on ad spend per channel</p>
          </div>
          <ROIComparisonChart />
        </div>
      </div>
    </div>
  );
}
