'use client';

import { useAgeGroup } from '@/lib/hooks/use-age-group';
import { AgeSelector } from './AgeSelector';
import { ReactNode } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface AgeGateProps {
  children: ReactNode;
}

export function AgeGate({ children }: AgeGateProps) {
  const { ageGroup, setAgeGroup, isInitialized } = useAgeGroup();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isInitialized) {
    return null;
  }

  if (!ageGroup) {
    return <AgeSelector onSelect={setAgeGroup} />;
  }

  const handleResetAge = () => {
    setAgeGroup(null);
    setShowResetConfirm(false);
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative group">
          <button
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors border border-gray-200"
            onClick={() => setShowResetConfirm(true)}
            aria-label="切换年龄组"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-black/80 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            切换年龄组
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <RotateCcw size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                切换年龄组
              </h3>
              <p className="text-gray-600 mb-6">
                确定要重新选择年龄组吗？当前进度将会重置。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleResetAge}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  确认切换
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
