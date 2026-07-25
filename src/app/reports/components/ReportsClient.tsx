'use client';

import React, { useState, useRef } from 'react';
import { campaigns, aiRecommendations, revenueTrend, channelBreakdown, computeROI, computeCTR, computeCVR, computeCPC, computeCPA, formatINR,  } from '@/lib/mockData';
import {
  FileBarChart,
  Download,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  BarChart2,
  DollarSign,
  Users,
  Target,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

// Compute enriched campaigns
const enriched = campaigns.map((c) => ({
  ...c,
  roi: computeROI(c.revenue, c.spend),
  ctr: computeCTR(c.clicks, c.impressions),
  cvr: computeCVR(c.conversions, c.clicks),
  cpc: computeCPC(c.spend, c.clicks),
  cpa: computeCPA(c.spend, c.conversions),
}));

const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
const avgROI = parseFloat((enriched.reduce((s, c) => s + c.roi, 0) / enriched.length).toFixed(1));
const avgCTR = parseFloat((enriched.reduce((s, c) => s + c.ctr, 0) / enriched.length).toFixed(2));

const typeIcons: Record<string, string> = {
  increase: '↑',
  decrease: '↓',
  optimize: '⚡',
  alert: '⚠',
};

function buildPrintHTML(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const kpiRows = [
    ['Total Campaigns', campaigns.length.toString()],
    ['Total Budget', formatINR(totalBudget)],
    ['Total Spend', formatINR(totalSpend)],
    ['Total Revenue', formatINR(totalRevenue)],
    ['Total Conversions', totalConversions.toLocaleString('en-IN')],
    ['Average ROI', `${avgROI}%`],
    ['Average CTR', `${avgCTR}%`],
    ['Total Clicks', totalClicks.toLocaleString('en-IN')],
  ];

  const campaignRows = enriched
    .sort((a, b) => b.roi - a.roi)
    .map(
      (c) => `
      <tr>
        <td>${c.name}</td>
        <td>${c.channel}</td>
        <td style="text-transform:capitalize">${c.status}</td>
        <td style="text-align:right">${formatINR(c.budget, true)}</td>
        <td style="text-align:right">${formatINR(c.spend, true)}</td>
        <td style="text-align:right">${formatINR(c.revenue, true)}</td>
        <td style="text-align:right;color:${c.roi >= 0 ? '#16a34a' : '#dc2626'};font-weight:600">${c.roi > 0 ? '+' : ''}${c.roi}%</td>
        <td style="text-align:right">${c.ctr}%</td>
        <td style="text-align:right">${c.conversions.toLocaleString('en-IN')}</td>
        <td style="text-align:right">₹${c.cpa}</td>
      </tr>`
    )
    .join('');

  const channelRows = channelBreakdown
    .sort((a, b) => b.roi - a.roi)
    .map(
      (ch) => `
      <tr>
        <td>${ch.channel}</td>
        <td style="text-align:right">${formatINR(ch.budget, true)}</td>
        <td style="text-align:right">${formatINR(ch.revenue, true)}</td>
        <td style="text-align:right;color:${ch.roi >= 0 ? '#16a34a' : '#dc2626'};font-weight:600">${ch.roi > 0 ? '+' : ''}${ch.roi}%</td>
        <td style="text-align:right">${ch.conversions.toLocaleString('en-IN')}</td>
      </tr>`
    )
    .join('');

  const recCards = aiRecommendations
    .map(
      (r) => `
      <div class="rec-card rec-${r.type}">
        <div class="rec-header">
          <span class="rec-icon">${typeIcons[r.type]}</span>
          <div>
            <span class="rec-priority priority-${r.priority}">${r.priority.toUpperCase()} PRIORITY</span>
            <p class="rec-headline">${r.headline}</p>
          </div>
        </div>
        <p class="rec-detail">${r.detail}</p>
        <div class="rec-impact">Potential Impact: <strong>${r.potentialImpact}</strong></div>
      </div>`
    )
    .join('');

  const trendRows = revenueTrend
    .map(
      (pt) => `
      <tr>
        <td>${pt.month}</td>
        <td style="text-align:right">${formatINR(pt.revenue, true)}</td>
        <td style="text-align:right">${formatINR(pt.spend, true)}</td>
        <td style="text-align:right">${pt.conversions.toLocaleString('en-IN')}</td>
        <td style="text-align:right;color:#16a34a;font-weight:600">${formatINR(pt.revenue - pt.spend, true)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>GrowthLens Report — ${dateStr}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; font-size: 12px; line-height: 1.5; }
  .page { max-width: 900px; margin: 0 auto; padding: 32px 40px; }
  
  /* Header */
  .report-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 28px; }
  .brand { font-size: 22px; font-weight: 800; color: #7c3aed; letter-spacing: -0.5px; }
  .brand-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .report-meta { text-align: right; }
  .report-title { font-size: 16px; font-weight: 700; color: #1a1a2e; }
  .report-date { font-size: 11px; color: #6b7280; margin-top: 3px; }

  /* Section */
  .section { margin-bottom: 32px; }
  .section-title { font-size: 14px; font-weight: 700; color: #1a1a2e; border-left: 3px solid #7c3aed; padding-left: 10px; margin-bottom: 14px; }

  /* KPI Grid */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .kpi-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; background: #fafafa; }
  .kpi-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .kpi-value { font-size: 16px; font-weight: 700; color: #1a1a2e; font-variant-numeric: tabular-nums; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
  td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) { background: #fafafa; }

  /* Recommendations */
  .rec-card { border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; border: 1px solid; }
  .rec-increase { background: #f0fdf4; border-color: #bbf7d0; }
  .rec-decrease { background: #fef2f2; border-color: #fecaca; }
  .rec-optimize { background: #fffbeb; border-color: #fde68a; }
  .rec-alert { background: #fffbeb; border-color: #fde68a; }
  .rec-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
  .rec-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .rec-priority { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 2px; }
  .priority-high { color: #dc2626; }
  .priority-medium { color: #d97706; }
  .priority-low { color: #6b7280; }
  .rec-headline { font-size: 12px; font-weight: 600; color: #1a1a2e; }
  .rec-detail { font-size: 11px; color: #4b5563; line-height: 1.6; margin-bottom: 8px; }
  .rec-impact { font-size: 11px; color: #16a34a; background: #f0fdf4; border-radius: 6px; padding: 5px 10px; display: inline-block; }

  /* Footer */
  .report-footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 20px; }
    .section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="report-header">
    <div>
      <div class="brand">GrowthLens</div>
      <div class="brand-sub">AI-Powered Marketing Decision Intelligence</div>
    </div>
    <div class="report-meta">
      <div class="report-title">Campaign Performance Report</div>
      <div class="report-date">Generated: ${dateStr}</div>
      <div class="report-date">${campaigns.length} campaigns · All channels</div>
    </div>
  </div>

  <!-- KPI Summary -->
  <div class="section">
    <div class="section-title">Executive Summary — Key Performance Indicators</div>
    <div class="kpi-grid">
      ${kpiRows.map(([label, value]) => `
        <div class="kpi-card">
          <div class="kpi-label">${label}</div>
          <div class="kpi-value">${value}</div>
        </div>`).join('')}
    </div>
  </div>

  <!-- Campaign Breakdown -->
  <div class="section">
    <div class="section-title">Campaign Breakdown (Sorted by ROI)</div>
    <table>
      <thead>
        <tr>
          <th>Campaign</th><th>Channel</th><th>Status</th>
          <th style="text-align:right">Budget</th><th style="text-align:right">Spend</th>
          <th style="text-align:right">Revenue</th><th style="text-align:right">ROI</th>
          <th style="text-align:right">CTR</th><th style="text-align:right">Conv.</th>
          <th style="text-align:right">CPA</th>
        </tr>
      </thead>
      <tbody>${campaignRows}</tbody>
    </table>
  </div>

  <!-- Channel Performance -->
  <div class="section">
    <div class="section-title">Channel Performance Summary</div>
    <table>
      <thead>
        <tr>
          <th>Channel</th>
          <th style="text-align:right">Budget</th>
          <th style="text-align:right">Revenue</th>
          <th style="text-align:right">ROI</th>
          <th style="text-align:right">Conversions</th>
        </tr>
      </thead>
      <tbody>${channelRows}</tbody>
    </table>
  </div>

  <!-- Revenue Trend -->
  <div class="section">
    <div class="section-title">Monthly Revenue Trend</div>
    <table>
      <thead>
        <tr>
          <th>Month</th>
          <th style="text-align:right">Revenue</th>
          <th style="text-align:right">Spend</th>
          <th style="text-align:right">Conversions</th>
          <th style="text-align:right">Net Profit</th>
        </tr>
      </thead>
      <tbody>${trendRows}</tbody>
    </table>
  </div>

  <!-- AI Recommendations -->
  <div class="section">
    <div class="section-title">AI-Powered Recommendations (${aiRecommendations.length} insights)</div>
    ${recCards}
  </div>

  <!-- Footer -->
  <div class="report-footer">
    <span>GrowthLens · AI Marketing Intelligence Platform</span>
    <span>Report generated on ${dateStr} · All values in INR (₹)</span>
  </div>

</div>
</body>
</html>`;
}

type ExportFormat = 'pdf' | 'print';

interface ReportSection {
  id: string;
  label: string;
  description: string;
  included: boolean;
}

export default function ReportsClient() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [sections, setSections] = useState<ReportSection[]>([
    { id: 'kpis', label: 'KPI Summary', description: 'Total budget, revenue, ROI, CTR, conversions', included: true },
    { id: 'campaigns', label: 'Campaign Breakdown', description: 'Per-campaign metrics sorted by ROI', included: true },
    { id: 'channels', label: 'Channel Performance', description: 'Budget and revenue by marketing channel', included: true },
    { id: 'trend', label: 'Revenue Trend', description: 'Monthly revenue and spend over time', included: true },
    { id: 'recommendations', label: 'AI Recommendations', description: 'AI-generated budget and optimization insights', included: true },
  ]);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s))
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
      toast.success('Report ready!', { description: 'Click "Open Report" to view and print/save as PDF.' });
    }, 1800);
  };

  const handleOpenReport = () => {
    const html = buildPrintHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
        }, 500);
      };
    }
    toast.info('Report opened in new tab', { description: 'Use Ctrl+P / Cmd+P to save as PDF.' });
  };

  const includedCount = sections.filter((s) => s.included).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground tracking-tight">Report Generation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Export your dashboard data as a comprehensive PDF summary with KPIs, charts, and AI recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-600 text-primary">AI Insights Included</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: Config */}
        <div className="lg:col-span-1 space-y-4">
          {/* Report Sections */}
          <div className="card-glass p-5">
            <h3 className="text-sm font-600 text-foreground mb-4 flex items-center gap-2">
              <FileBarChart size={14} className="text-muted-foreground" />
              Report Sections
              <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-600 text-primary">
                {includedCount}/{sections.length}
              </span>
            </h3>
            <div className="space-y-2.5">
              {sections.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-150 ${
                    s.included
                      ? 'border-primary/30 bg-primary/5' :'border-border bg-card/30 hover:bg-card/60'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={s.included}
                      onChange={() => toggleSection(s.id)}
                      className="sr-only"
                    />
                    <div
                      className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                        s.included ? 'border-primary bg-primary' : 'border-border bg-transparent'
                      }`}
                    >
                      {s.included && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-600 text-foreground">{s.label}</p>
                    <p className="text-2xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || includedCount === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Report…
              </>
            ) : (
              <>
                <FileBarChart size={16} />
                Generate Report
              </>
            )}
          </button>

          {generated && (
            <button
              onClick={handleOpenReport}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-positive/30 bg-positive/10 px-5 py-3 text-sm font-600 text-positive transition-all duration-150 hover:bg-positive/15 active:scale-95 animate-fade-in"
            >
              <Download size={16} />
              Open Report &amp; Save PDF
            </button>
          )}
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Report Preview Card */}
          <div className="card-glass overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <FileBarChart size={15} className="text-muted-foreground" />
                <h3 className="text-sm font-600 text-foreground">Report Preview</h3>
              </div>
              {generated && (
                <span className="flex items-center gap-1.5 rounded-full bg-positive/15 px-2.5 py-1 text-2xs font-600 text-positive">
                  <CheckCircle2 size={11} />
                  Ready
                </span>
              )}
            </div>

            {/* Mock report preview */}
            <div className="p-5 space-y-5">
              {/* Header preview */}
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-base font-800 text-primary">GrowthLens</p>
                    <p className="text-2xs text-muted-foreground">AI-Powered Marketing Decision Intelligence</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-600 text-foreground">Campaign Performance Report</p>
                    <p className="text-2xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                      <Calendar size={10} />
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-primary/30" />
              </div>

              {/* KPI preview */}
              {sections.find((s) => s.id === 'kpis')?.included && (
                <div>
                  <p className="text-xs font-700 text-foreground mb-3 flex items-center gap-2">
                    <BarChart2 size={12} className="text-primary" />
                    Executive Summary — Key Performance Indicators
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: 'Campaigns', value: campaigns.length.toString(), icon: Target },
                      { label: 'Total Revenue', value: formatINR(totalRevenue, true), icon: DollarSign },
                      { label: 'Average ROI', value: `${avgROI}%`, icon: TrendingUp },
                      { label: 'Conversions', value: totalConversions.toLocaleString('en-IN'), icon: Users },
                    ].map((kpi) => {
                      const KpiIcon = kpi.icon;
                      return (
                        <div key={kpi.label} className="rounded-lg border border-border bg-card/50 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <KpiIcon size={11} className="text-muted-foreground" />
                            <span className="text-2xs text-muted-foreground">{kpi.label}</span>
                          </div>
                          <p className="text-sm font-700 font-mono text-foreground">{kpi.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Campaign table preview */}
              {sections.find((s) => s.id === 'campaigns')?.included && (
                <div>
                  <p className="text-xs font-700 text-foreground mb-3 flex items-center gap-2">
                    <BarChart2 size={12} className="text-primary" />
                    Campaign Breakdown (Top 4 by ROI)
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs min-w-[500px]">
                      <thead className="bg-muted/40">
                        <tr>
                          {['Campaign', 'Channel', 'Revenue', 'ROI', 'CTR'].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {enriched.sort((a, b) => b.roi - a.roi).slice(0, 4).map((c) => (
                          <tr key={c.id} className="hover:bg-muted/20">
                            <td className="px-3 py-2 text-foreground font-500 truncate max-w-[140px]">{c.name}</td>
                            <td className="px-3 py-2 text-muted-foreground">{c.channel}</td>
                            <td className="px-3 py-2 font-mono text-foreground">{formatINR(c.revenue, true)}</td>
                            <td className={`px-3 py-2 font-mono font-600 ${c.roi >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {c.roi > 0 ? '+' : ''}{c.roi}%
                            </td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">{c.ctr}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI Recs preview */}
              {sections.find((s) => s.id === 'recommendations')?.included && (
                <div>
                  <p className="text-xs font-700 text-foreground mb-3 flex items-center gap-2">
                    <Sparkles size={12} className="text-primary" />
                    AI Recommendations ({aiRecommendations.length} insights)
                  </p>
                  <div className="space-y-2">
                    {aiRecommendations.slice(0, 3).map((rec) => {
                      const typeColors: Record<string, string> = {
                        increase: 'border-positive/20 bg-positive/5',
                        decrease: 'border-negative/20 bg-negative/5',
                        optimize: 'border-warning/20 bg-warning/5',
                        alert: 'border-warning/20 bg-warning/5',
                      };
                      const RecIcon = rec.type === 'increase' ? TrendingUp : rec.type === 'decrease' ? TrendingDown : rec.type === 'optimize' ? Zap : AlertTriangle;
                      const iconColor = rec.type === 'increase' ? 'text-positive' : rec.type === 'decrease' ? 'text-negative' : 'text-warning';
                      return (
                        <div key={rec.id} className={`rounded-lg border p-3 ${typeColors[rec.type]}`}>
                          <div className="flex items-start gap-2">
                            <RecIcon size={13} className={`mt-0.5 flex-shrink-0 ${iconColor}`} />
                            <div>
                              <p className="text-xs font-600 text-foreground">{rec.headline}</p>
                              <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-2">{rec.detail}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {aiRecommendations.length > 3 && (
                      <p className="text-2xs text-muted-foreground text-center py-1">
                        +{aiRecommendations.length - 3} more recommendations in full report
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!generated && (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 px-5 py-8 text-center">
                  <FileBarChart size={28} className="mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Click "Generate Report" to build your PDF</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {includedCount} section{includedCount !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              {generated && (
                <div className="rounded-xl border border-positive/20 bg-positive/5 px-5 py-5 text-center animate-fade-in">
                  <CheckCircle2 size={28} className="mx-auto mb-2 text-positive" />
                  <p className="text-sm font-600 text-foreground">Report Generated Successfully</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Open Report &amp; Save PDF" to view and download
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
