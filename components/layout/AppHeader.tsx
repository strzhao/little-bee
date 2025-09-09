'use client';

import { useSetAtom } from 'jotai';
import { isControlCenterOpenAtom } from '@/lib/atoms/ui-atoms';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ReactNode } from 'react';

interface AppHeaderProps {
  /** 自定义中间区域内容 */
  customContent?: ReactNode;
  /** 是否显示设置按钮 */
  showSettings?: boolean;
}

export function AppHeader({ customContent, showSettings = true }: AppHeaderProps) {
  const setIsControlCenterOpen = useSetAtom(isControlCenterOpenAtom);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
      {/* 标题区域 */}
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold">识字小蜜蜂 🐝</h1>
      </div>
      
      {/* 自定义填充区域 */}
      <div className="flex-1 flex items-center justify-center px-2">
        <div className="w-full max-w-none">
          {customContent}
        </div>
      </div>
      
      {/* 设置区域 */}
      <div className="flex-shrink-0">
        {showSettings && (
          <Button variant="ghost" size="icon" onClick={() => setIsControlCenterOpen(true)}>
            <Settings className="h-6 w-6" />
          </Button>
        )}
      </div>
    </header>
  );
}