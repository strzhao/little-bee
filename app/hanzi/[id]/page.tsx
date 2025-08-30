'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home } from 'lucide-react';

// --- Type Definitions ---
interface EvolutionStage {
  scriptName: string;
  timestamp: number;
  narrationAudio: string;
  explanation: string;
  scriptText: string; // Added scriptText
  fontFamily: string; // Added fontFamily
  cardColor: string;
}

interface HanziData {
  id: string;
  character: string;
  pinyin: string;
  theme: string;
  meaning: string;
  assets: {
    pronunciationAudio: string;
    mainIllustration: string;
    realObjectImage: string;
    realObjectCardColor: string;
    lottieAnimation: string;
  };
  evolutionStages: EvolutionStage[];
}

// --- Main Page Component ---
export default function HanziDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [characterData, setCharacterData] = useState<HanziData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch('/data/hanzi-data.json')
      .then(res => res.json())
      .then(allData => {
        const data = allData.find((c: HanziData) => c.id === id);
        setCharacterData(data || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load hanzi-data.json', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="w-screen h-screen flex justify-center items-center bg-amber-50">Loading Character...</div>;
  }

  if (!characterData) {
    return <div className="w-screen h-screen flex justify-center items-center bg-amber-50">Character not found.</div>;
  }

  return <EvolutionPlayer characterData={characterData} />;
}

// --- Core Player Component (Hybrid Image/Font Display) ---
const EvolutionPlayer = ({ characterData }: { characterData: HanziData }) => {
  const [activeStage, setActiveStage] = useState(-2); // -2 for Real Object
  const [currentImageUrl, setCurrentImageUrl] = useState(characterData.assets.realObjectImage);
  const narrationRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setCurrentImageUrl(characterData.assets.realObjectImage);
    setActiveStage(-2);
  }, [characterData]);

  useEffect(() => {
    if (!narrationRef.current) {
      narrationRef.current = new Audio();
    }
  }, []);

  const handleCardClick = (stageIndex: number) => {
    setActiveStage(stageIndex);
    let audioUrl = '';

    if (stageIndex === -2) { // Real Object
      setCurrentImageUrl(characterData.assets.realObjectImage);
    } else { // Evolution Stage (0 and up)
      const stage = characterData.evolutionStages[stageIndex];
      if (stage) {
        // For font stages, currentImageUrl is not relevant for display
        // The main display area will use stage.scriptText and stage.fontFamily
        setCurrentImageUrl(''); // Clear image if switching to font display
        audioUrl = stage.narrationAudio;
      }
    }

    if (narrationRef.current && audioUrl) {
      narrationRef.current.src = audioUrl;
      narrationRef.current.play().catch(e => console.error("Audio play failed", e));
    } else if (narrationRef.current) {
      narrationRef.current.pause();
    }
  };
  
  const getExplanation = () => {
      if (activeStage === -2) return `我们生活中看到的“${characterData.character}”是这个样子的。`;
      if (activeStage >= 0 && characterData.evolutionStages[activeStage]) {
          return characterData.evolutionStages[activeStage].explanation;
      }
      return '点击左侧的彩色圆圈，开始探索它的故事吧！';
  }

  return (
    <div className="w-screen h-screen bg-stone-100 flex flex-col md:flex-row p-4 sm:p-6 md:p-8 gap-6 md:gap-8">
      
      <div className="w-full md:w-auto flex flex-col gap-4 flex-shrink-0 items-center">
        <Link href="/hanzi" passHref>
          <motion.button whileTap={{ scale: 0.95 }} className="w-28 p-3 bg-white/70 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center gap-2">
            <Home className="w-5 h-5 text-stone-700"/>
            <span className="font-semibold">首页</span>
          </motion.button>
        </Link>

        <div className="hidden md:block h-px w-full bg-stone-300 my-2"></div>

        <div className="flex-grow flex flex-row md:flex-col gap-5 overflow-x-auto md:overflow-x-hidden p-4 justify-center items-center">
          
          {/* Real Object Card */}
          <motion.div
            onClick={() => handleCardClick(-2)}
            className="w-24 h-24 rounded-full cursor-pointer flex-shrink-0 shadow-md flex items-center justify-center bg-blue-300"
            style={{ backgroundColor: characterData.assets.realObjectCardColor }}
            animate={{ scale: activeStage === -2 ? 1.25 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <p className="text-2xl font-serif font-semibold text-white">实物</p>
          </motion.div>

          {characterData.evolutionStages.map((stage, index) => (
            <motion.div
              key={index}
              onClick={() => handleCardClick(index)}
              className="w-24 h-24 rounded-full cursor-pointer flex-shrink-0 shadow-md flex items-center justify-center"
              style={{ backgroundColor: stage.cardColor }}
              animate={{ scale: activeStage === index ? 1.25 : 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <p className="text-2xl font-serif font-semibold text-white">{stage.scriptName}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full h-full flex-grow flex flex-col items-center justify-center gap-6 bg-white/50 rounded-2xl shadow-lg p-4">
        <div className="w-full flex-grow flex justify-center items-center rounded-lg bg-white shadow-inner overflow-hidden p-4">
          {activeStage === -2 ? (
            <motion.img 
              key={currentImageUrl}
              src={currentImageUrl} 
              alt="实物" 
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <p className="text-9xl font-bold" style={{ fontFamily: characterData.evolutionStages[activeStage]?.fontFamily }}>
              {characterData.evolutionStages[activeStage]?.scriptText}
            </p>
          )}
        </div>
        <div className="w-full max-w-3xl text-center h-24 flex items-center justify-center p-2">
          <p className="text-stone-600 text-lg md:text-xl">
            {getExplanation()}
          </p>
        </div>
      </div>

    </div>
  );
};