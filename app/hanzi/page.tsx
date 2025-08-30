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
  learnedCount: number; // 已学习的汉字数量
}

// 星星进度组件
interface StarProgressProps {
  total: number;
  learned: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarProgress = ({ total, learned, size = 'md' }: StarProgressProps) => {
  const maxStars = 5;
  const progress = total > 0 ? learned / total : 0;
  const filledStars = Math.floor(progress * maxStars);
  const hasPartialStar = (progress * maxStars) % 1 > 0;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, index) => {
        const isFilled = index < filledStars;
        const isPartial = index === filledStars && hasPartialStar;
        
        return (
          <div key={index} className={`relative ${sizeClasses[size]}`}>
            {/* 背景星星 */}
            <svg className={`${sizeClasses[size]} text-gray-200`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            
            {/* 填充星星 */}
            {(isFilled || isPartial) && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: isPartial ? '50%' : '100%' }}>
                <svg className={`${sizeClasses[size]} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
      <span className="text-xs text-gray-500 ml-1">{learned}/{total}</span>
    </div>
  );
}

// 简化的星星进度组件（用于卡片右上角）
const SimpleStarProgress = ({ total, learned }: { total: number; learned: number }) => {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-yellow-400">★</span>
      <span className="text-gray-600">{learned}/{total}</span>
    </div>
  );
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
        
        // 模拟每个类别的学习进度
        const mockProgress = {
          '天空与气象': 2,
          '水与地理': 3,
          '植物世界': 1,
          '动物王国': 2,
          '基础汉字': 0
        };
        
        const categoryConfigs: CategoryConfig[] = [
          {
            name: '天空与气象',
            emoji: '🌤️',
            count: masterConfig.categories.find(c => c.name === '天空与气象')?.count || 0,
            bgColor: 'bg-blue-50',
            available: true,
            learnedCount: mockProgress['天空与气象']
          },
          {
            name: '水与地理',
            emoji: '🌊',
            count: masterConfig.categories.find(c => c.name === '水与地理')?.count || 0,
            bgColor: 'bg-cyan-50',
            available: true,
            learnedCount: mockProgress['水与地理']
          },
          {
            name: '植物世界',
            emoji: '🌱',
            count: masterConfig.categories.find(c => c.name === '植物世界')?.count || 0,
            bgColor: 'bg-green-50',
            available: true,
            learnedCount: mockProgress['植物世界']
          },
          {
            name: '动物王国',
            emoji: '🐾',
            count: masterConfig.categories.find(c => c.name === '动物王国')?.count || 0,
            bgColor: 'bg-orange-50',
            available: true,
            learnedCount: mockProgress['动物王国']
          },
          {
            name: '基础汉字',
            emoji: '📚',
            count: masterConfig.categories.find(c => c.name === '基础汉字')?.count || 0,
            bgColor: 'bg-gray-50',
            available: false,
            learnedCount: mockProgress['基础汉字']
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
        <div className="text-base text-gray-600 mr-24">
          总进度: {learnedCount}/{totalCharacters}
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
      } relative`}
      whileHover={category.available ? { scale: 1.02 } : {}}
      whileTap={category.available ? { scale: 0.98 } : {}}
      onClick={handleClick}
    >
      {/* 右上角进度 */}
      {category.available && (
        <div className="absolute top-3 right-3">
          <SimpleStarProgress total={category.count} learned={category.learnedCount} />
        </div>
      )}
      
      <div className="text-center">
        <div className="text-4xl mb-4">{category.emoji}</div>
        <h3 className="text-xl font-medium text-gray-800 mb-3">{category.name}</h3>
        {category.available ? (
          <p className="text-sm text-gray-500">{category.count}个汉字</p>
        ) : (
          <p className="text-base text-gray-600">即将开放</p>
        )}
      </div>
    </motion.div>
  );
};
