import AppLayout from '@/components/AppLayout';
import { CampaignsProvider } from '../components/CampaignsProvider';
import { AnalyticsProvider } from '../components/AnalyticsProvider';
import ReportsClient from './components/ReportsClient';

export default function ReportsPage() {
  return (
    <AppLayout currentPath="/reports">
      <CampaignsProvider>
        <AnalyticsProvider>
          <ReportsClient />
        </AnalyticsProvider>
      </CampaignsProvider>
    </AppLayout>
  );
}
