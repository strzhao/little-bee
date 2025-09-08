'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgeSwitcher } from '@/components/features/settings/AgeSwitcher';

export function SettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>应用设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AgeSwitcher />
        {/* Other settings can be added here */}
      </CardContent>
    </Card>
  );
}
