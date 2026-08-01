import React from 'react';
import AppLayout from '@/components/AppLayout';
import { CampaignsProvider } from '../components/CampaignsProvider';
import AnalyticsClient from './components/AnalyticsClient';

export default function AnalyticsPage() {
  return (
    <AppLayout currentPath="/analytics">
      <CampaignsProvider>
        <AnalyticsClient />
      </CampaignsProvider>
    </AppLayout>
  );
}
