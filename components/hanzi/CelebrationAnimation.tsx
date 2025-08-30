'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Star from './Star';

const CelebrationAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [starPosition, setStarPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const counter = document.getElementById('success-star-counter');
    if (counter) {
      const rect = counter.getBoundingClientRect();
      setStarPosition({ x: rect.left + window.scrollX, y: rect.top + window.scrollY });
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-center pointer-events-none z-[100]">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{
          scale: [0, 1.2, 1],
          rotate: 0,
          x: [0, 0, starPosition.x - window.innerWidth / 2],
          y: [0, 0, starPosition.y - window.innerHeight / 2],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.3, 1],
          ease: ["easeOut", "easeInOut"],
        }}
        onAnimationComplete={onComplete}
      >
        <Star size={100} />
      </motion.div>
    </div>
  );
};

export default CelebrationAnimation;