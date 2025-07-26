'use client';

import dynamic from 'next/dynamic';

// Dynamically import AppUI without SSR
const AppUI = dynamic(() => import('@/app/maps/AppUI'), { ssr: false });

export default function TrucksPage() {
  return <AppUI show="pm" />;
}
