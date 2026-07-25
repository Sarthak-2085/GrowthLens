import React from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsClient from './components/SettingsClient';

export default function SettingsPage() {
  return (
    <AppLayout currentPath="/settings">
      <SettingsClient />
    </AppLayout>
  );
}
