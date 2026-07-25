'use client';

import React from 'react';
import { campaigns, computeROI, formatINR, channelColors } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

const topCampaigns = [...campaigns]?.sort((a, b) => computeROI(b?.revenue, b?.spend) - computeROI(a?.revenue, a?.spend))?.slice(0, 5);

export default function TopCampaignsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 text-left text-xs font-600 uppercase tracking-wider text-muted-foreground">
              Campaign
            </th>
            <th className="pb-3 text-left text-xs font-600 uppercase tracking-wider text-muted-foreground">
              Channel
            </th>
            <th className="pb-3 text-right text-xs font-600 uppercase tracking-wider text-muted-foreground">
              Budget
            </th>
            <th className="pb-3 text-right text-xs font-600 uppercase tracking-wider text-muted-foreground">
              Revenue
            </th>
            <th className="pb-3 text-right text-xs font-600 uppercase tracking-wider text-muted-foreground">
              ROI
            </th>
            <th className="pb-3 text-left text-xs font-600 uppercase tracking-wider text-muted-foreground pl-4">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {topCampaigns?.map((campaign) => {
            const roi = computeROI(campaign?.revenue, campaign?.spend);
            const roiPositive = roi >= 0;

            return (
              <tr
                key={campaign?.id}
                className="group transition-colors hover:bg-white/3"
              >
                <td className="py-3 pr-4">
                  <p className="font-500 text-foreground truncate max-w-[200px]" title={campaign?.name}>
                    {campaign?.name}
                  </p>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: channelColors?.[campaign?.channel] || 'var(--muted-foreground)' }}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{campaign?.channel}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {formatINR(campaign?.budget, true)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="font-mono text-xs font-600 text-foreground tabular-nums">
                    {formatINR(campaign?.revenue, true)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`font-mono text-xs font-700 tabular-nums ${
                      roi >= 100
                        ? 'text-positive'
                        : roi >= 0
                        ? 'text-warning' :'text-negative'
                    }`}
                  >
                    {roiPositive ? '+' : ''}{roi}%
                  </span>
                </td>
                <td className="py-3 pl-4">
                  <StatusBadge status={campaign?.status} size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}