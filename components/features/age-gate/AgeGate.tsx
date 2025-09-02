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
    // Render nothing or a loading spinner to prevent flash of unstyled content
    // or incorrect page.
    return null;
  }

  if (!ageGroup) {
    return <AgeSelector onSelect={setAgeGroup} />;
  }

  return <>{children}</>;
}
