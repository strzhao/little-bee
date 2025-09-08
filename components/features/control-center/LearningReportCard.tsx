import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LearningReportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>学习报告</CardTitle>
      </CardHeader>
      <CardContent>
        <p>总进度: 0/20</p>
      </CardContent>
    </Card>
  );
}
