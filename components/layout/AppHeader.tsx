'use client';

import { useSetAtom, useAtomValue } from 'jotai';
import { isControlCenterOpenAtom, isImmersiveModeAtom } from '@/lib/atoms/ui-atoms';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export function AppHeader() {
  const setIsControlCenterOpen = useSetAtom(isControlCenterOpenAtom);
  const isImmersiveMode = useAtomValue(isImmersiveModeAtom);

  if (isImmersiveMode) {
    // In immersive mode, show only the settings button in the top-right corner with no background.
    return (
      <header className="fixed top-0 right-0 z-50 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsControlCenterOpen(true)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </header>
    );
  }

  // Default header with title and background.
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm">
      <h1 className="text-xl font-bold">识字小蜜蜂 🐝</h1>
      <Button variant="ghost" size="icon" onClick={() => setIsControlCenterOpen(true)}>
        <Settings className="h-6 w-6" />
      </Button>
    </header>
  );
}