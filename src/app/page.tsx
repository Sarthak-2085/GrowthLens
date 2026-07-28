import React from 'react';
import AppLayout from '@/components/AppLayout';
import { CampaignsProvider } from './components/CampaignsProvider';
import DashboardHeader from './components/DashboardHeader';
import KPIBentoGrid from './components/KPIBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import DashboardBottomSection from './components/DashboardBottomSection';

export default function DashboardPage() {
  return (
    <AppLayout currentPath="/">
      <CampaignsProvider>
        <div className="space-y-6 animate-fade-in">
          <DashboardHeader />
          <KPIBentoGrid />
          <DashboardCharts />
          <DashboardBottomSection />
        </div>
      </CampaignsProvider>
    </AppLayout>
  );
}