'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AgeGate } from '@/components/features/age-gate/AgeGate';
import { useAgeGroup } from '@/lib/hooks/use-age-group';
import { AGE_GROUPS } from '@/lib/constants';
import { Settings } from 'lucide-react';

import { ToddlerGamePage } from '@/components/features/hanzi-game-toddler/ToddlerGamePage';
import HanziUnifiedPage from '@/components/hanzi/HanziUnifiedPage';

// Placeholder for the Child Game Page
function ChildGamePage() {
  const router = useRouter();
  
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-blue-100 relative pt-20">
      <h1 className="text-3xl font-bold">探索版 (5-7岁) 游戏即将上线</h1>
    </div>
  );
}

function AgeSpecificContent() {
  const { ageGroup } = useAgeGroup();

  switch (ageGroup) {
    case AGE_GROUPS.TODDLER:
      return <ToddlerGamePage />;
    case AGE_GROUPS.CHILD:
      return <ChildGamePage />;
    case AGE_GROUPS.STUDENT:
      return <HanziUnifiedPage />;
    default:
      return null;
  }
}

export default function HomePage() {
  return (
    <AgeGate>
      <AgeSpecificContent />
    </AgeGate>
  );
}