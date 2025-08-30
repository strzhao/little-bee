'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hanziDataLoader, HanziCharacter } from '@/lib/hanzi-data-loader';

interface CategoryConfig {
  name: string;
  emoji: string;
  count: number;
  bgColor: string;
  available: boolean;
  learnedCount: number;
}

interface CategoryTransitionProps {
  category: CategoryConfig | null;
  isOpen: boolean;
  onClose: () => void;
  clickPosition: { x: number; y: number } | null;
}

export default function CategoryTransition({ 
  category, 
  isOpen, 
  onClose, 
  clickPosition 
}: CategoryTransitionProps) {
  const [hanziList, setHanziList] = useState<HanziCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'expanding' | 'content' | 'closing'>('expanding');

  useEffect(() => {
    if (isOpen && category) {
      setLoading(true);
      setAnimationPhase('expanding');
      
      const loadCategoryData = async () => {
        try {
          await hanziDataLoader.initialize();
          const data = await hanziDataLoader.loadByCategory(category.name);
          if (data && data.length > 0) {
            setHanziList(data);
          }
        } catch (err) {
          console.error('加载类别数据失败:', err);
        } finally {
          setLoading(false);
          // 立即显示内容，与扩展动画同时进行
          setAnimationPhase('content');
        }
      };

      loadCategoryData();
    }
  }, [isOpen, category]);

  const handleClose = () => {
    setAnimationPhase('closing');
    // 延迟关闭，等待收缩动画完成
    setTimeout(() => {
      onClose();
      setAnimationPhase('expanding');
    }, 800);
  };

  if (!isOpen || !category || !clickPosition) return null;

  // 获取背景颜色的CSS类名对应的实际颜色
  const getBgColorValue = (bgColorClass: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-blue-50': '#eff6ff',
      'bg-cyan-50': '#ecfeff', 
      'bg-green-50': '#f0fdf4',
      'bg-orange-50': '#fff7ed',
      'bg-gray-50': '#f9fafb'
    };
    return colorMap[bgColorClass] || '#f9fafb';
  };

  const bgColor = getBgColorValue(category.bgColor);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* 扩展的圆形背景 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            backgroundColor: bgColor,
            left: clickPosition.x - 140, // 140是卡片半径的近似值
            top: clickPosition.y - 140,
            width: 280,
            height: 280,
          }}
          initial={{
            scale: 1,
            x: 0,
            y: 0,
          }}
          animate={{
            scale: animationPhase === 'closing' ? 1 : 20,
            x: animationPhase === 'closing' ? 0 : -clickPosition.x + 140,
            y: animationPhase === 'closing' ? 0 : -clickPosition.y + 140,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        />

        {/* 移动到左上角的标题和图标 */}
        <motion.div
          className="absolute top-8 left-8 flex items-center space-x-4 z-10"
          initial={{
            x: clickPosition.x - 32,
            y: clickPosition.y - 32,
            scale: 2,
          }}
          animate={{
            x: animationPhase === 'closing' ? clickPosition.x - 32 : 0,
            y: animationPhase === 'closing' ? clickPosition.y - 32 : 0,
            scale: animationPhase === 'closing' ? 2 : 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            delay: animationPhase === 'closing' ? 0 : 0,
          }}
        >
          <motion.button
            onClick={handleClose}
            className="hover:scale-110 transition-transform"
            initial={{ fontSize: '2rem' }}
            animate={{ fontSize: animationPhase === 'closing' ? '2rem' : '3rem' }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {category.emoji}
          </motion.button>
          <div>
            <motion.h1 
              className="font-bold text-gray-800"
              initial={{ fontSize: '1.5rem' }}
              animate={{ fontSize: animationPhase === 'closing' ? '1.5rem' : '1.875rem' }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {category.name}
            </motion.h1>
            <motion.p 
              className="text-gray-600"
              initial={{ fontSize: '0.875rem' }}
              animate={{ fontSize: animationPhase === 'closing' ? '0.875rem' : '1rem' }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              共 {hanziList.length} 个汉字
            </motion.p>
          </div>
        </motion.div>

        {/* 返回按钮 - 增大尺寸方便小朋友使用 */}
        <motion.button
          onClick={handleClose}
          className="absolute top-8 right-8 z-20 bg-white/80 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: animationPhase === 'closing' ? 0 : 1, scale: animationPhase === 'closing' ? 0.8 : 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        {/* 汉字卡片网格 */}
        <div
          className="absolute inset-0 pt-32 px-8 pb-8 overflow-y-auto"
          style={{ opacity: animationPhase === 'closing' ? 0 : 1 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {hanziList.map((hanzi, index) => (
                <CircularHanziCard key={hanzi.id} hanzi={hanzi} index={index} isVisible={animationPhase !== 'expanding'} />
              ))}
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg">正在加载汉字...</p>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

const CircularHanziCard = ({ 
  hanzi, 
  index, 
  isVisible 
}: { 
  hanzi: HanziCharacter; 
  index: number; 
  isVisible: boolean; 
}) => {
  return (
    <motion.div
      initial={{ 
        scale: 0, 
        opacity: 0,
        rotate: -180 
      }}
      animate={{ 
        scale: isVisible ? 1 : 0, 
        opacity: isVisible ? 1 : 0,
        rotate: isVisible ? 0 : -180
      }}
      transition={{ 
        delay: index * 0.02, 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-full aspect-square p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-white/20 flex flex-col items-center justify-center"
        whileHover={{ 
          scale: 1.05, 
          y: -4,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          // 跳转到汉字详情页
          window.location.href = `/hanzi/${hanzi.id}`;
        }}
      >
        <div className="text-center">
          <div className="text-3xl font-serif mb-2 text-gray-800">
            {hanzi.character}
          </div>
          <div className="text-xs text-blue-600 mb-1 font-medium">
            {hanzi.pinyin}
          </div>
          <div className="text-xs text-gray-600 line-clamp-2 leading-tight">
            {hanzi.meaning}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};