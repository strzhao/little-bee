'use client';

import { useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/lib/hooks/use-hanzi-state';
import { isCollectedHanziModalOpenAtom } from '@/lib/atoms/ui-atoms';

export function AchievementsCard() {
  const { progress } = useLearningProgress();
  const setModalOpen = useSetAtom(isCollectedHanziModalOpenAtom);

  const totalStars = useMemo(() => {
    return Object.values(progress).reduce((sum, p) => sum + (p.starsEarned || 0), 0);
  }, [progress]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>成就中心</CardTitle>
        <CardDescription>您已获得 {totalStars} 颗星星！</CardDescription>
      </CardHeader>
      <CardContent>
        {/* You can add a summary or some badges here in the future */}
        <p className="text-sm text-muted-foreground">继续努力，解锁更多汉字吧！</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setModalOpen(true)} className="w-full">
          查看我收集的汉字
        </Button>
      </CardFooter>
    </Card>
  );
}
