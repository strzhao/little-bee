'use client';

import React, { useState, useEffect } from 'react';
import Star from './Star';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLearningProgress } from '@/lib/hooks/use-hanzi-state';

interface SuccessfulCharacter {
  id: string;
  character: string;
  count: number;
}

const SuccessStars = () => {
  const [showModal, setShowModal] = useState(false);
  const [successfulChars, setSuccessfulChars] = useState<SuccessfulCharacter[]>([]);
  
  // 使用新的Jotai状态管理获取学习进度
  const { progress } = useLearningProgress();
  
  // 计算总星数
  const starCount = Object.values(progress).reduce((sum, char) => sum + char.starsEarned, 0);
  
  useEffect(() => {
    // 转换进度数据为成功字符格式，用于显示详情
    const chars: SuccessfulCharacter[] = Object.values(progress)
      .filter(p => p.completed && p.starsEarned > 0)
      .map(p => ({
        id: p.characterId,
        character: p.characterId, // 这里可能需要从汉字数据中获取实际字符
        count: p.starsEarned
      }));
    
    setSuccessfulChars(chars);
  }, [progress]);

  return (
    <>
      <motion.div 
        id="success-star-counter" 
        className="fixed top-4 right-6 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-md cursor-pointer z-40"
        onClick={() => setShowModal(true)}
        whileTap={{ scale: 0.95 }}
      >
        <Star id="success-star-icon" size={24} color="#FFD700" />
        <span className="font-bold text-lg text-yellow-500">{starCount}</span>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-end z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="bg-white rounded-t-2xl p-6 shadow-xl w-full h-3/4 flex flex-col"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <h2 className="text-2xl font-bold text-center mb-6 text-stone-700">我收集的汉字</h2>
              {successfulChars.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 overflow-y-auto">
                  {successfulChars.map((char) => (
                    <Link href={`/hanzi/${char.id}`} key={char.id} passHref>
                      <motion.div 
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowModal(false)}
                      >
                        <span className="text-5xl font-bold text-amber-600">{char.character}</span>
                        <div className="flex items-center mt-2">
                          <Star size={16} color="#FFC700" />
                          <span className="ml-1 text-sm font-semibold text-yellow-600">{char.count}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-center items-center">
                    <p className="text-center text-stone-500">你还没有收集到任何汉字哦，</p>
                    <p className="text-center text-stone-500">快去挑战游戏吧！</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SuccessStars;