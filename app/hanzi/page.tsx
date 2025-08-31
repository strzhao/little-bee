'use client';

import { Suspense } from 'react';
import HanziUnifiedPage from '@/components/hanzi/HanziUnifiedPage';

function HanziPageContent() {
  console.log('🏠 [HanziPage] 汉字首页组件渲染');
  return <HanziUnifiedPage />;
}

export default function HanziPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">加载中...</div>}>
      <HanziPageContent />
    </Suspense>
  );
}
