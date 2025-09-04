'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home, Sparkles, Settings } from 'lucide-react';

// 导入页面状态管理
import {
  hanziPageStateAtom,
  pageModeAtom,
  selectedCharacterIdAtom,
  transitionDataAtom,
  navigateToDetailAtom,
  navigateToHomeAtom,
  CategoryConfig
} from '@/lib/atoms/hanzi-page-atoms';

// 导入现有组件
import SuccessStars from '@/components/hanzi/SuccessStars';
import CategoryTransition from '@/components/hanzi/CategoryTransition';
import CelebrationAnimation from '@/components/hanzi/CelebrationAnimation';
import VoicePlayer from '@/components/hanzi/VoicePlayer';
import ExplanationVoicePlayer, { ExplanationVoicePlayerRef } from '@/components/hanzi/ExplanationVoicePlayer';

// 导入状态管理钩子
import { useHanziState, useLearningProgress } from '@/lib/hooks/use-hanzi-state';
import { hanziDataLoader } from '@/lib/hanzi-data-loader';
import { CategoryProgress } from '@/lib/learning-progress';
import { HanziCharacter } from '@/lib/atoms/hanzi-atoms';

// 导入详情页组件（将在下一步创建）
import HanziDetailView from './HanziDetailView';

// 类型定义
interface StarProgressProps {
  total: number;
  learned: number;
  size?: 'sm' | 'md' | 'lg';
}

// 星星进度组件
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
};

// 简化的星星进度组件
const SimpleStarProgress = ({ total, learned }: { total: number; learned: number }) => {
  return (
    <div className="flex items-center gap-2 text-lg">
      <span className="text-yellow-400 text-2xl">★</span>
      <span className="text-gray-700 font-bold">{learned}/{total}</span>
    </div>
  );
};

// 类别卡片组件
const CategoryCard = ({ 
  category, 
  onCategoryClick,
  isReturning = false 
}: { 
  category: CategoryConfig;
  onCategoryClick?: (category: CategoryConfig, position: { x: number; y: number }) => void;
  isReturning?: boolean;
}) => {
  const { allHanzi } = useHanziState();
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (category.available && onCategoryClick) {
      // 获取点击位置（卡片中心）
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      onCategoryClick(category, position);
    }
  };

  return (
    <motion.div
      className={`${category.bgColor} rounded-full aspect-square p-12 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        !category.available ? 'opacity-60 cursor-not-allowed' : ''
      } relative flex flex-col items-center justify-center min-h-[280px]`}
      whileHover={category.available ? { scale: 1.02 } : {}}
      whileTap={category.available ? { scale: 0.98 } : {}}
      onClick={handleClick}
    >
      <div className="text-center flex flex-col items-center justify-center h-full">
        <div 
          className="text-8xl mb-6 transition-opacity duration-300"
          style={{ opacity: isReturning ? 0 : 1 }}
        >
          {category.emoji}
        </div>
        <h3 
          className="text-3xl font-bold text-gray-800 mb-4 transition-opacity duration-300"
          style={{ opacity: isReturning ? 0 : 1 }}
        >
          {category.name}
        </h3>
        
        {/* 居中的星星进度 */}
        {category.available && (
          <div 
            className="mb-4 transition-opacity duration-300"
            style={{ opacity: isReturning ? 0 : 1 }}
          >
            <SimpleStarProgress total={category.count} learned={category.learnedCount} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 首页视图组件
const HanziHomeView = ({ onNavigateToDetail }: { onNavigateToDetail: (characterId: string) => void }) => {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryProgress, setCategoryProgress] = useState<Record<string, CategoryProgress>>({});
  const router = useRouter();
  
  // 使用Jotai状态管理
  const { categoryProgress: jotaiCategoryProgress, overallProgress } = useLearningProgress();
  const { loadAllCharacters, allHanzi } = useHanziState();
  
  // 页面状态管理
  const [, navigateToDetail] = useAtom(navigateToDetailAtom);
  const [transitionData] = useAtom(transitionDataAtom);
  
  // 过渡动画状态
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 加载所有汉字数据到Jotai状态
        await loadAllCharacters();
        
        await hanziDataLoader.initialize();
        const masterConfig = await hanziDataLoader.getMasterConfig();
        
        if (!masterConfig) {
          throw new Error('Failed to load master config');
        }
        
        // 使用Jotai的分类进度数据
        const progressData: Record<string, CategoryProgress> = {};
        Object.entries(jotaiCategoryProgress).forEach(([category, stats]) => {
          progressData[category] = {
            categoryName: category,
            learnedCount: stats.completed,
            totalCount: stats.total,
            learnedCharacters: []
          };
        });
        setCategoryProgress(progressData);
        
        // 使用Jotai的总体进度
        const totalLearned = overallProgress.completed;
        
        const allCategoryConfigs: CategoryConfig[] = [
          {
            name: '天空与气象',
            emoji: '🌤️',
            count: masterConfig.categories.find(c => c.name === '天空与气象')?.count || 0,
            bgColor: 'bg-blue-50',
            available: true,
            learnedCount: progressData['天空与气象']?.learnedCount || 0
          },
          {
            name: '水与地理',
            emoji: '🌊',
            count: masterConfig.categories.find(c => c.name === '水与地理')?.count || 0,
            bgColor: 'bg-cyan-50',
            available: true,
            learnedCount: progressData['水与地理']?.learnedCount || 0
          },
          {
            name: '植物世界',
            emoji: '🌱',
            count: masterConfig.categories.find(c => c.name === '植物世界')?.count || 0,
            bgColor: 'bg-green-50',
            available: true,
            learnedCount: progressData['植物世界']?.learnedCount || 0
          },
          {
            name: '动物王国',
            emoji: '🐾',
            count: masterConfig.categories.find(c => c.name === '动物王国')?.count || 0,
            bgColor: 'bg-orange-50',
            available: true,
            learnedCount: progressData['动物王国']?.learnedCount || 0
          },
          {
            name: '基础汉字',
            emoji: '📚',
            count: masterConfig.categories.find(c => c.name === '基础汉字')?.count || 0,
            bgColor: 'bg-gray-50',
            available: false,
            learnedCount: progressData['基础汉字']?.learnedCount || 0
          }
        ];
        
        // 过滤掉没有汉字的类别
        const categoryConfigs = allCategoryConfigs.filter(category => category.count > 0);
        
        setCategories(categoryConfigs);
        setTotalCharacters(overallProgress.total);
        setLearnedCount(totalLearned);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setLoading(false);
      }
    };
    
    loadCategories();
  }, [jotaiCategoryProgress, overallProgress, loadAllCharacters]);

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
        <h1 className="text-2xl font-medium text-gray-800">识字小蜜蜂🐝</h1>
        <div className="flex items-center gap-4">
          <div className="text-base text-gray-600">
            总进度: {learnedCount}/{totalCharacters}
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
            title="应用设置"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600 hidden sm:inline">设置</span>
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 类别网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard 
                key={category.name} 
                category={category} 
                isReturning={isReturning && selectedCategory?.name === category.name}
                onCategoryClick={(category, position) => {
                  console.log('🎯 [HanziHomeView] 分类卡片点击:', {
                      categoryName: category.name,
                      currentPath: window.location.pathname
                    });
                  
                  setSelectedCategory(category);
                  setClickPosition(position);
                  setIsTransitionOpen(true);
                 }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* 过渡动画组件 */}
      <CategoryTransition
        category={selectedCategory}
        isOpen={isTransitionOpen}
        onClose={() => {
          setIsTransitionOpen(false);
          setSelectedCategory(null);
          setClickPosition(null);
        }}
        clickPosition={clickPosition}
        onReturning={setIsReturning}
        onNavigateToDetail={onNavigateToDetail}
      />
      
      {/* 星星计数器 */}
      <SuccessStars onNavigateToDetail={onNavigateToDetail} />
    </div>
  );
};

// 主统一页面组件
export default function HanziUnifiedPage() {
  // URL 参数处理
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [pageMode, setPageMode] = useAtom(pageModeAtom);
  const [selectedCharacterId, setSelectedCharacterId] = useAtom(selectedCharacterIdAtom);
  const [, navigateToDetail] = useAtom(navigateToDetailAtom);
  const [, navigateToHome] = useAtom(navigateToHomeAtom);
  
  // 组件挂载时重置状态，确保从干净状态开始
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/hanzi') {
      // 只在/hanzi路由下重置状态
      setPageMode('home');
      setSelectedCharacterId(null);
    }
  }, []); // 只在组件挂载时执行一次
  
  // 处理URL参数 - 只在/hanzi路由下处理
  useEffect(() => {
    // 检查当前路径是否为/hanzi（不包括子路由）
    const currentPath = window.location.pathname;
    console.log('🔍 [HanziUnifiedPage] URL参数监听触发:', {
      currentPath,
      searchParams: searchParams.toString(),
      shouldProcess: currentPath === '/hanzi'
    });
    
    if (currentPath !== '/hanzi') {
      console.log('⏭️ [HanziUnifiedPage] 跳过URL参数处理，当前路径:', currentPath);
      return; // 如果不是/hanzi路由，不处理URL参数
    }
    
    const mode = searchParams.get('mode');
    const id = searchParams.get('id');
    
    console.log('📊 [HanziUnifiedPage] URL参数解析:', { mode, id });
    
    if (mode === 'detail' && id) {
      console.log('🎯 [HanziUnifiedPage] 切换到详情模式:', id);
      setPageMode('detail');
      setSelectedCharacterId(id);
    } else {
      console.log('🏠 [HanziUnifiedPage] 切换到首页模式');
      setPageMode('home');
      setSelectedCharacterId(null);
    }
  }, [searchParams, setPageMode, setSelectedCharacterId]);
  
  // 更新导航函数 - 直接设置页面状态，不执行路由跳转
  const handleNavigateToDetail = (characterId: string) => {
    console.log('🎯 [HanziUnifiedPage] 直接切换到详情页:', characterId);
    setPageMode('detail');
    setSelectedCharacterId(characterId);
  };
  
  const handleNavigateToHome = () => {
    console.log('🏠 [HanziUnifiedPage] 直接切换到首页');
    setPageMode('home');
    setSelectedCharacterId(null);
  };

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {pageMode === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <HanziHomeView onNavigateToDetail={handleNavigateToDetail} />
          </motion.div>
        )}
        
        {pageMode === 'detail' && selectedCharacterId && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <HanziDetailView 
              characterId={selectedCharacterId}
              onNavigateHome={handleNavigateToHome}
            />
          </motion.div>
        )}
        
        {pageMode === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="w-full h-full bg-white flex items-center justify-center"
          >
            <div className="text-xl text-gray-600">切换中...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}