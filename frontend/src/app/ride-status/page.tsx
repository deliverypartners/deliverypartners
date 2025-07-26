'use client';

import { Suspense } from 'react';
import RideStatus from '@/components/RideStatus';

export default function RideStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">Loading...</div>}>
      <RideStatus />
    </Suspense>
  );
}
