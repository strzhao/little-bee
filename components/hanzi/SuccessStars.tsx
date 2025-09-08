'use client';

import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import Star from './Star';
import { isCollectedHanziModalOpenAtom } from '@/lib/atoms/ui-atoms';
import { useLearningProgress, useHanziState } from '@/lib/hooks/use-hanzi-state';

interface SuccessfulCharacter {
  id: string;
  character: string;
  count: number;
}

interface SuccessStarsProps {
  onNavigateToDetail?: (characterId: string) => void;
}

const SuccessStars = ({ onNavigateToDetail }: SuccessStarsProps = {}) => {
  const [showModal, setShowModal] = useAtom(isCollectedHanziModalOpenAtom);
  const [successfulChars, setSuccessfulChars] = useState<SuccessfulCharacter[]>([]);
  
  const { progress } = useLearningProgress();
  const { allHanzi } = useHanziState(); // Use this to map IDs to characters

  useEffect(() => {
    if (allHanzi.length === 0) return;

    const hanziMap = new Map(allHanzi.map(h => [h.id, h.character]));
    const chars: SuccessfulCharacter[] = Object.values(progress)
      .filter(p => p.completed && p.starsEarned > 0)
      .map(p => ({
        id: p.characterId,
        character: hanziMap.get(p.characterId) || '？', // Fallback for safety
        count: p.starsEarned
      }));
    
    setSuccessfulChars(chars);
  }, [progress, allHanzi]);

  return (
    <>
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
                    <motion.div 
                      key={char.id}
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setShowModal(false);
                        if (onNavigateToDetail) {
                          onNavigateToDetail(char.id);
                        }
                      }}
                    >
                        <span className="text-5xl font-bold text-amber-600">{char.character}</span>
                        <div className="flex items-center mt-2">
                          <Star size={16} color="#FFC700" />
                          <span className="ml-1 text-sm font-semibold text-yellow-600">{char.count}</span>
                        </div>
                    </motion.div>
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
