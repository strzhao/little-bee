'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Home, Sparkles } from 'lucide-react';
import CelebrationAnimation from '@/components/hanzi/CelebrationAnimation';


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
  const [allCharacters, setAllCharacters] = useState<HanziData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch('/data/hanzi-data.json')
      .then(res => res.json())
      .then(allData => {
        const data = allData.find((c: HanziData) => c.id === id);
        setCharacterData(data || null);
        setAllCharacters(allData);
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

  return <EvolutionPlayer characterData={characterData} allCharacters={allCharacters} />;
}

// --- Core Player Component (Hybrid Image/Font Display) ---
const EvolutionPlayer = ({ characterData, allCharacters }: { characterData: HanziData, allCharacters: HanziData[] }) => {
  const [activeStage, setActiveStage] = useState(-2); // -2 for Real Object
  const [currentImageUrl, setCurrentImageUrl] = useState(characterData.assets.realObjectImage);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const [isChallengeModalOpen, setChallengeModalOpen] = useState(false);
  const [challengeOptions, setChallengeOptions] = useState<HanziData[]>([]);
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showCelebration, setShowCelebration] = useState(false);

  const startChallenge = () => {
    const distractors = allCharacters
      .filter(c => c.id !== characterData.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    const options = [characterData, ...distractors].sort(() => 0.5 - Math.random());
    setChallengeOptions(options);
    setChallengeStatus('idle');
    setChallengeModalOpen(true);
  };

  const handleOptionClick = (selectedId: string) => {
    if (challengeStatus !== 'idle') return; // Prevent multiple clicks

    if (selectedId === characterData.id) {
      setChallengeStatus('correct');
      setShowCelebration(true); // Trigger animation
    } else {
      setChallengeStatus('incorrect');
    }
  };

  const handleAnimationComplete = () => {
    const currentCount = parseInt(localStorage.getItem('hanzi-challenge-success') || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem('hanzi-challenge-success', newCount.toString());
    // Manually dispatch a storage event so the SuccessStars component updates
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'hanzi-challenge-success',
        newValue: newCount.toString(),
    }));

    setShowCelebration(false);
    setChallengeModalOpen(false);
    setChallengeStatus('idle');
  };

  const closeChallenge = () => {
    setChallengeModalOpen(false);
    setChallengeStatus('idle');
  };

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
        <div className="w-full flex-grow flex flex-col md:flex-row gap-6">
          {/* 左侧：字符展示区 */}
          <div className="w-full md:w-2/3 flex justify-center items-center rounded-lg bg-white shadow-inner overflow-hidden p-4">
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
          
          {/* 右侧：信息区 */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            {activeStage >= 0 && (
              <AnimatePresence>
                <motion.div
                  key="character-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-white rounded-lg shadow-md p-4 text-center"
                >
                  <p className="text-4xl font-bold text-stone-800">{characterData.character}</p>
                  <p className="text-xl text-stone-600">{characterData.pinyin}</p>
                  <p className="text-lg text-stone-500">{characterData.meaning}</p>
                </motion.div>
              </AnimatePresence>
            )}
            
            <div className="flex-grow bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
              <p className="text-stone-600 text-lg md:text-xl text-center">
                {getExplanation()}
              </p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={startChallenge}
              className="w-full p-4 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md flex items-center justify-center gap-2 text-lg"
            >
              <Sparkles className="w-6 h-6" />
              开始小挑战
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCelebration && <CelebrationAnimation onComplete={handleAnimationComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {isChallengeModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
            onClick={closeChallenge}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-xl relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {challengeStatus === 'correct' ? (
                <div className="w-full h-64 flex justify-center items-center">
                   {/* Now the celebration animation is handled outside the modal */}
                </div>
              ) : (
                <>
                  <img src={characterData.assets.realObjectImage} alt={characterData.character} className="w-full h-48 object-cover rounded-lg mb-4"/>
                  <p className="text-center text-3xl font-bold text-stone-700 mb-8">哪一个是“{characterData.character}”字？</p>
                  <div className="grid grid-cols-3 gap-6">
                    {challengeOptions.map(option => (
                      <motion.button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        whileTap={{ scale: 0.9 }}
                        className={`p-6 rounded-2xl text-5xl font-bold flex justify-center items-center shadow-md transition-colors duration-200 ${ 
                          challengeStatus === 'incorrect' && option.id !== characterData.id ? 'bg-red-200' : 'bg-stone-100 hover:bg-amber-200'
                        }`}
                      >
                        {option.character}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};