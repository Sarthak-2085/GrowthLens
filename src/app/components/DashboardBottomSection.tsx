import React from 'react';
import TopCampaignsTable from './TopCampaignsTable';
import AIRecommendationsPanel from './AIRecommendationsPanel';
import { Zap, Trophy } from 'lucide-react';

export default function DashboardBottomSection() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5">
      {/* Top Campaigns Table — 3 cols */}
      <div className="lg:col-span-3 card-glass p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-warning" />
            <h2 className="text-base font-600 text-foreground">Top Campaigns by ROI</h2>
          </div>
          <a
            href="/analytics"
            className="text-xs font-500 text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </a>
        </div>
        <TopCampaignsTable />
      </div>

      {/* AI Recommendations — 2 cols */}
      <div className="lg:col-span-2 card-glass p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <Zap size={14} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-600 text-foreground">AI Recommendations</h2>
            <p className="text-xs text-muted-foreground">5 actionable insights</p>
          </div>
        </div>
        <AIRecommendationsPanel />
      </div>
    </div>
  );
}