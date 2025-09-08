'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearningProgress } from '@/lib/hooks/use-hanzi-state';

export function AchievementsCard() {
  const { progress } = useLearningProgress();

  const totalStars = useMemo(() => {
    return Object.values(progress).reduce((sum, p) => sum + (p.starsEarned || 0), 0);
  }, [progress]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>成就中心</CardTitle>
      </CardHeader>
      <CardContent>
        <p>🏆 您已获得 {totalStars} 颗星星！</p>
      </CardContent>
    </Card>
  );
}
