'use client';

import { Suspense } from 'react';
import DriverDashboard from '@/components/driver/DriverDashboard';

export default function DriverDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">Loading...</div>}>
      <DriverDashboard />
    </Suspense>
  );
}
