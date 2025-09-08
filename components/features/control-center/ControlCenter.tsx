'use client';

import { useAtom } from 'jotai';
import { isControlCenterOpenAtom } from '@/lib/atoms/ui-atoms';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LearningReportCard } from './LearningReportCard';
import { AchievementsCard } from './AchievementsCard';
import { SettingsCard } from './SettingsCard';

export function ControlCenter() {
  const [isOpen, setIsOpen] = useAtom(isControlCenterOpenAtom);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[350px] sm:w-[540px] p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle>控制中心</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-6">
          <LearningReportCard />
          <AchievementsCard />
          <SettingsCard />
        </div>
      </SheetContent>
    </Sheet>
  );
}
