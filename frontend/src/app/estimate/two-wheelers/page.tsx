'use client';

import dynamic from 'next/dynamic';

const AppUI = dynamic(() => import('@/app/maps/AppUI'), { ssr: false });

export default function TwoWheelerPage() {
  return <AppUI show="bike" />;
}
