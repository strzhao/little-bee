'use client';

import { useAgeGroup } from '@/lib/hooks/use-age-group';
import { AgeSelector } from './AgeSelector';
import { ReactNode } from 'react';

interface AgeGateProps {
  children: ReactNode;
}

export function AgeGate({ children }: AgeGateProps) {
  const { ageGroup, setAgeGroup, isInitialized } = useAgeGroup();

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  if (!ageGroup) {
    return <AgeSelector onSelect={setAgeGroup} />;
  }

  return <>{children}</>;
}