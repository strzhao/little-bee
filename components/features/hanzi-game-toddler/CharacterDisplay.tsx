'use client';

import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { useEffect, useRef } from 'react';

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
    <div className="text-center">
      <h1 className="text-8xl font-bold text-gray-800 md:text-9xl" style={{ fontFamily: 'KaiTi, STKaiti, serif' }}>
        {character.character}
      </h1>
      <p className="mt-2 text-3xl text-gray-500">{character.pinyin}</p>
      <audio ref={audioRef} src={character.assets.pronunciationAudio} preload="auto" />
    </div>
  );
}
