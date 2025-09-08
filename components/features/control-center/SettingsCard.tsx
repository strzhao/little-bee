import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>应用设置</CardTitle>
      </CardHeader>
      <CardContent>
        <p>在这里管理您的偏好。</p>
      </CardContent>
    </Card>
  );
}
