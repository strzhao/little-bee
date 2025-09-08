import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AchievementsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>成就中心</CardTitle>
      </CardHeader>
      <CardContent>
        <p>🏆 您已获得 3 个成就！</p>
      </CardContent>
    </Card>
  );
}
