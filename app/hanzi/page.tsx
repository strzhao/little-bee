'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Define the types based on our JSON structure
interface HanziData {
  id: string;
  character: string;
  pinyin: string;
  theme: string;
  meaning: string;
}

// Main Page Component
export default function HanziHomePage() {
  const [data, setData] = useState<HanziData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/hanzi-data.json')
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="w-screen h-screen flex justify-center items-center bg-amber-50">Loading...</div>;
  }

  return <ExplorationWorld characters={data} />;
}

// --- Child Components (kept in the same file for simplicity for now) ---

const ExplorationWorld = ({ characters }: { characters: HanziData[] }) => {
  const themes = [...new Set(characters.map(c => c.theme))];

  return (
    <div className="w-full h-screen overflow-hidden bg-amber-50 flex items-center">
      <motion.div
        className="flex gap-40 px-20 h-full items-center"
        drag="x"
        dragConstraints={{ right: 0, left: -1000 }} // Adjust as needed
      >
        <div className='text-center w-64 flex-shrink-0'>
            <h1 className='text-4xl font-serif text-amber-800'>汉字演变乐园</h1>
            <p className='text-amber-600 mt-2'>拖动以探索</p>
        </div>
        {themes.map(theme => (
          <ThematicIsland key={theme} theme={theme} characters={characters.filter(c => c.theme === theme)} />
        ))}
      </motion.div>
    </div>
  );
};

const ThematicIsland = ({ theme, characters }: { theme: string; characters: HanziData[] }) => {
  const themeColors: { [key: string]: string } = {
    nature: 'bg-green-200',
  };

  return (
    <div className="relative w-96 h-96 flex-shrink-0">
      {/* The Island itself */}
      <motion.div 
        className={`w-full h-full rounded-full ${themeColors[theme] || 'bg-gray-200'} shadow-lg`}
      />
      <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white select-none">
        {theme === 'nature' ? '自然' : theme}
      </h2>

      {/* Character Sprites floating around the island */}
      {characters.map((char, index) => (
        <CharacterSprite key={char.id} character={char} index={index} total={characters.length} />
      ))}
    </div>
  );
};

const CharacterSprite = ({ character, index, total }: { character: HanziData; index: number; total: number }) => {
  const angle = (index / total) * 2 * Math.PI;
  const radius = 220; // Distance from center
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ x: `${x-25}px`, y: `${y-25}px` }} // Center the sprite
      animate={{
        y: [`${y - 35}px`, `${y - 15}px`, `${y - 35}px`],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    >
      <Link href={`/hanzi/${character.id}`} passHref>
        <motion.div
          className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md flex justify-center items-center text-4xl font-serif cursor-pointer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          {character.character}
        </motion.div>
      </Link>
    </motion.div>
  );
};
