'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { hanziDataLoader, HanziCharacter } from '@/lib/hanzi-data-loader';

interface CategoryPageProps {
  params: {
    name: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [hanziList, setHanziList] = useState<HanziCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const categoryName = decodeURIComponent(params.name);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        await hanziDataLoader.initialize();
        const data = await hanziDataLoader.loadByCategory(categoryName);
        if (data && data.length > 0) {
          setHanziList(data);
        } else {
          setError('未找到该类别的汉字数据');
        }
      } catch (err) {
        console.error('加载类别数据失败:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载汉字...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-medium text-gray-800 mb-2">出错了</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/hanzi" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/hanzi" className="text-blue-600 hover:text-blue-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-medium text-gray-900">{categoryName}</h1>
            </div>
            <div className="text-sm text-gray-600">
              共 {hanziList.length} 个汉字
            </div>
          </div>
        </div>
      </header>

      {/* 汉字网格 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
          {hanziList.map((hanzi, index) => (
            <HanziCard key={hanzi.id} hanzi={hanzi} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}

// 汉字卡片组件
const HanziCard = ({ hanzi, index }: { hanzi: HanziCharacter; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/hanzi/${hanzi.id}`}>
        <motion.div
          className="bg-white rounded-2xl p-10 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 min-h-[200px] flex items-center justify-center"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center">
            <div className="text-6xl font-serif mb-4 text-gray-800">
              {hanzi.character}
            </div>
            <div className="text-lg text-blue-600 mb-2 font-medium">
              {hanzi.pinyin}
            </div>
            <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {hanzi.meaning}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};