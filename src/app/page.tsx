import React from 'react';
import AppLayout from '@/components/AppLayout';
import { CampaignsProvider } from './components/CampaignsProvider';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import DashboardHeader from './components/DashboardHeader';
import KPIBentoGrid from './components/KPIBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import DashboardBottomSection from './components/DashboardBottomSection';
import CampaignSimulator from './components/CampaignSimulator';

export default function DashboardPage() {
  return (
    <AppLayout currentPath="/">
      <CampaignsProvider>
        <AnalyticsProvider>
          <div className="space-y-6 animate-fade-in">
            <DashboardHeader />
            <KPIBentoGrid />
            <DashboardCharts />
            <DashboardBottomSection />
            <CampaignSimulator />
          </div>
        </AnalyticsProvider>
      </CampaignsProvider>
    </AppLayout>
  );
}