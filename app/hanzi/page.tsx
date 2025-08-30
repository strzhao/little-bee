'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { hanziDataLoader } from '@/lib/hanzi-data-loader';

// 类别配置
interface CategoryConfig {
  name: string;
  emoji: string;
  count: number;
  bgColor: string;
  available: boolean;
}

// Main Page Component
export default function HanziHomePage() {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [learnedCount, setLearnedCount] = useState(8); // 模拟已学习数量
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await hanziDataLoader.initialize();
        const masterConfig = await hanziDataLoader.getMasterConfig();
        
        if (!masterConfig) {
          throw new Error('Failed to load master config');
        }
        
        const categoryConfigs: CategoryConfig[] = [
          {
            name: '天空与气象',
            emoji: '🌤️',
            count: masterConfig.categories.find(c => c.name === '天空与气象')?.count || 0,
            bgColor: 'bg-blue-50',
            available: true
          },
          {
            name: '水与地理',
            emoji: '🌊',
            count: masterConfig.categories.find(c => c.name === '水与地理')?.count || 0,
            bgColor: 'bg-cyan-50',
            available: true
          },
          {
            name: '植物世界',
            emoji: '🌱',
            count: masterConfig.categories.find(c => c.name === '植物世界')?.count || 0,
            bgColor: 'bg-green-50',
            available: true
          },
          {
            name: '动物王国',
            emoji: '🐾',
            count: masterConfig.categories.find(c => c.name === '动物王国')?.count || 0,
            bgColor: 'bg-orange-50',
            available: true
          },
          {
            name: '基础汉字',
            emoji: '📚',
            count: masterConfig.categories.find(c => c.name === '基础汉字')?.count || 0,
            bgColor: 'bg-gray-50',
            available: false
          }
        ];
        
        setCategories(categoryConfigs);
        setTotalCharacters(masterConfig.totalCharacters);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
        <h1 className="text-2xl font-medium text-gray-800">汉字演变乐园</h1>
        <div className="text-base text-gray-600">
          学习进度: {learnedCount}/{totalCharacters}
        </div>
      </header>

      {/* 主内容区 */}
      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 类别网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 第一行：2个大卡片 */}
            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.slice(0, 2).map((category) => (
                <CategoryCard key={category.name} category={category} />
              ))}
            </div>
            
            {/* 第二行：3个卡片 */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.slice(2).map((category) => (
                <CategoryCard key={category.name} category={category} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 类别卡片组件
const CategoryCard = ({ category }: { category: CategoryConfig }) => {
  const handleClick = () => {
    if (category.available) {
      // 跳转到类别详情页面
      window.location.href = `/hanzi/category/${encodeURIComponent(category.name)}`;
    }
  };

  return (
    <motion.div
      className={`${category.bgColor} rounded-2xl p-8 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        !category.available ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      whileHover={category.available ? { scale: 1.02 } : {}}
      whileTap={category.available ? { scale: 0.98 } : {}}
      onClick={handleClick}
    >
      <div className="text-center">
        <div className="text-4xl mb-4">{category.emoji}</div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">{category.name}</h3>
        <p className="text-base text-gray-600">
          {category.available ? `${category.count}个汉字` : '即将开放'}
        </p>
      </div>
    </motion.div>
  );
};
