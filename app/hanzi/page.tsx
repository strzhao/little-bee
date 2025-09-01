import HanziUnifiedPage from '@/components/hanzi/HanziUnifiedPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '识字小蜜蜂 - 专为儿童设计的趣味汉字学习',
  description:
    '通过“识字小蜜蜂”，让孩子在互动和故事中探索汉字的起源和演变，从甲骨文、金文到楷书。激发学习兴趣，建立文化自信。',
};

export default function HanziPage() {
  return <HanziUnifiedPage />;
}