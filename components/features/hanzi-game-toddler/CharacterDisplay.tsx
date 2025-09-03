'use client';

import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VoicePlayer from '@/components/hanzi/VoicePlayer';

interface CharacterDisplayProps {
  character: HanziCharacter;
}

export function CharacterDisplay({ character }: CharacterDisplayProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Play the pronunciation audio whenever the character changes
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  }, [character]);

  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-center gap-4 mb-4">
        <motion.h1 
          className="text-8xl font-bold text-gray-800 md:text-9xl" 
          style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {character.character}
        </motion.h1>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <VoicePlayer 
            text={character.character} 
            size="lg" 
            autoPlay={true}
            preferredCNVoice={true}
          />
        </motion.div>
      </div>
      
      <motion.p 
        className="mt-2 text-3xl text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {character.pinyin}
      </motion.p>
      <audio ref={audioRef} src={character.assets.pronunciationAudio} preload="auto" />
    </motion.div>
  );
}
