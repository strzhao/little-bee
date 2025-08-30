'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Star from './Star';

const CelebrationAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [starPosition, setStarPosition] = React.useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const icon = document.getElementById('success-star-icon');
    if (icon) {
      const rect = icon.getBoundingClientRect();
      setStarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-center pointer-events-none z-[100]">
      <motion.div
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        animate={{
          scale: [0, 1.5, 0.1],
          rotate: 0,
          opacity: [0, 1, 1],
          x: [0, 0, starPosition.x - window.innerWidth / 2],
          y: [0, 0, starPosition.y - window.innerHeight / 2],
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.3, 1],
          ease: ['easeOut', 'easeInOut'],
        }}
        onAnimationComplete={onComplete}
      >
        <Star size={100} />
      </motion.div>
    </div>
  );
};

export default CelebrationAnimation;