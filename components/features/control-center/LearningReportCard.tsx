'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearningProgress } from '@/lib/hooks/use-hanzi-state';

export function LearningReportCard() {
  const { overallProgress } = useLearningProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle>学习报告</CardTitle>
      </CardHeader>
      <CardContent>
        <p>总进度: {overallProgress.completed}/{overallProgress.total}</p>
      </CardContent>
    </Card>
  );
}
