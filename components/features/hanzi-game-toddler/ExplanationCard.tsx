'use client';

import { motion } from 'framer-motion';

interface ExplanationCardProps {
  text: string;
}

export function ExplanationCard({ text }: ExplanationCardProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: '100%' }}
      animate={{ y: '0%' }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Effect layer */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-t-lg" />
      {/* Content layer */}
      <div className="relative p-6">
        <p className="text-center text-gray-700 font-semibold text-lg">
          {text}
        </p>
      </div>
    </motion.div>
  );
}
