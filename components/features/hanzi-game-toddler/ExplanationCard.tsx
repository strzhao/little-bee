'use client';

import { motion } from 'framer-motion';

interface ExplanationCardProps {
  text: string;
}

export function ExplanationCard({ text }: ExplanationCardProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg p-6 border-t border-gray-200 shadow-t-lg"
      initial={{ y: '100%' }}
      animate={{ y: '0%' }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <p className="text-center text-gray-700 font-semibold text-lg">
        {text}
      </p>
    </motion.div>
  );
}
