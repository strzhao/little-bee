import { Suspense } from 'react';
import HanziUnifiedPage from '@/components/hanzi/HanziUnifiedPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '识字小蜜蜂 - 专为儿童设计的趣味汉字学习',
  description:
    '通过"识字小蜜蜂"，让孩子在互动和故事中探索汉字的起源和演变，从甲骨文、金文到楷书。激发学习兴趣，建立文化自信。',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-yellow-700 font-medium">正在加载汉字学习页面...</p>
      </div>
    </div>
  );
}

export default function HanziPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HanziUnifiedPage />
    </Suspense>
  );
}