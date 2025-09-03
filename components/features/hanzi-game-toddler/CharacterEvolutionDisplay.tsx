'use client';

import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { motion } from 'framer-motion';

interface CharacterEvolutionDisplayProps {
  evolutionStages: HanziCharacter['evolutionStages'];
}

export function CharacterEvolutionDisplay({ evolutionStages }: CharacterEvolutionDisplayProps) {
  if (!evolutionStages || evolutionStages.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="w-full overflow-x-auto py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-4 px-4 justify-center"> {/* Added justify-center */}
        {evolutionStages.map((stage, index) => (
          <div key={index} className="flex-shrink-0 text-center">
            <div
              className="text-8xl font-bold" // Adjust size as needed
              style={{ fontFamily: stage.fontFamily }}
            >
              {stage.scriptText}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {stage.scriptName}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
