'use client';

import { useSetAtom } from 'jotai';
import { isControlCenterOpenAtom } from '@/lib/atoms/ui-atoms';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export function AppHeader() {
  const setIsControlCenterOpen = useSetAtom(isControlCenterOpenAtom);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm">
      <h1 className="text-xl font-bold">识字小蜜蜂 🐝</h1>
      <Button variant="ghost" size="icon" onClick={() => setIsControlCenterOpen(true)}>
        <Settings className="h-6 w-6" />
      </Button>
    </header>
  );
}
