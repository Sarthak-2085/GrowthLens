'use client';

import React, { useMemo } from 'react';
import { computeROI, formatINR, colorForChannel } from '@/lib/metrics';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Trophy } from 'lucide-react';
import { useCampaigns } from './CampaignsProvider';

export default function TopCampaignsTable() {
  const { campaigns, loading } = useCampaigns();

  const topCampaigns = useMemo(() => {
    const channels = Array.from(new Set(campaigns.map((c) => c.channel)));
    return [...campaigns]
      .sort((a, b) => computeROI(b.revenue, b.budget) - computeROI(a.revenue, a.budget))
      .slice(0, 5)
      .map((c) => ({ ...c, channelColor: colorForChannel(c.channel, channels) }));
  }, [campaigns]);

  if (loading) return <TableSkeleton rows={5} />;

  if (topCampaigns.length === 0) {
    return (
      <EmptyState
        icon={<Trophy size={24} />}
        title="No campaigns yet"
        description="Upload a CSV to see your top-performing campaigns ranked by ROI."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 text-left text-xs font-600 uppercase tracking-wider text-muted-foreground">Campaign</th>
            <th className="pb-3 text-left text-xs font-600 uppercase tracking-wider text-muted-foreground">Channel</th>
            <th className="pb-3 text-right text-xs font-600 uppercase tracking-wider text-muted-foreground">Budget</th>
            <th className="pb-3 text-right text-xs font-600 uppercase tracking-wider text-muted-foreground">Revenue</th>
            <th className="pb-3 text-right text-xs font-600 uppercase tracking-wider text-muted-foreground">ROI</th>
            <th className="pb-3 text-left text-xs font-600 uppercase tracking-wider text-muted-foreground pl-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {topCampaigns.map((campaign) => {
            const roi = computeROI(campaign.revenue, campaign.budget);
            const roiPositive = roi >= 0;

            return (
              <tr key={campaign.id} className="group transition-colors hover:bg-white/3">
                <td className="py-3 pr-4">
                  <p className="font-500 text-foreground truncate max-w-[200px]" title={campaign.campaign_name}>
                    {campaign.campaign_name}
                  </p>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: campaign.channelColor }} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{campaign.channel}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatINR(campaign.budget, true)}</span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="font-mono text-xs font-600 text-foreground tabular-nums">{formatINR(campaign.revenue, true)}</span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`font-mono text-xs font-700 tabular-nums ${
                      roi >= 100 ? 'text-positive' : roi >= 0 ? 'text-warning' : 'text-negative'
                    }`}
                  >
                    {roiPositive ? '+' : ''}{roi}%
                  </span>
                </td>
                <td className="py-3 pl-4">
                  <StatusBadge status={campaign.status} size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
