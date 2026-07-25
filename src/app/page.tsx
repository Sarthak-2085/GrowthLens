import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import KPIBentoGrid from './components/KPIBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import DashboardBottomSection from './components/DashboardBottomSection';

export default function DashboardPage() {
  return (
    <AppLayout currentPath="/">
      <div className="space-y-6 animate-fade-in">
        <DashboardHeader />
        <KPIBentoGrid />
        <DashboardCharts />
        <DashboardBottomSection />
      </div>
    </AppLayout>
  );
}