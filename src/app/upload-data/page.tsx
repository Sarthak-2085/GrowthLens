import React from 'react';
import AppLayout from '@/components/AppLayout';
import UploadDataClient from './components/UploadDataClient';

export default function UploadDataPage() {
  return (
    <AppLayout currentPath="/upload-data">
      <UploadDataClient />
    </AppLayout>
  );
}