'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Home, Sparkles } from 'lucide-react';
import CelebrationAnimation from '@/components/hanzi/CelebrationAnimation';
import VoicePlayer from '@/components/hanzi/VoicePlayer';
import ExplanationVoicePlayer, { ExplanationVoicePlayerRef } from '@/components/hanzi/ExplanationVoicePlayer';
import { hanziDataLoader, HanziCharacter } from '@/lib/hanzi-data-loader';


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
  category?: string;
  learningStage?: string;
  assets: {
    pronunciationAudio: string;
    mainIllustration: string;
    realObjectImage: string;
    realObjectCardColor?: string;
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
    
    const loadData = async () => {
      try {
        await hanziDataLoader.initialize();
        
        // Load specific character
        const character = await hanziDataLoader.loadCharacterById(id);
        if (character) {
          setCharacterData(character as HanziData);
        }
        
        // Load all characters for navigation
        const categories = hanziDataLoader.getAvailableCategories();
        const allData: HanziCharacter[] = [];
        for (const category of categories) {
          const categoryData = await hanziDataLoader.loadByCategory(category);
          allData.push(...categoryData);
        }
        setAllCharacters(allData as HanziData[]);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load character data:', error);
        setLoading(false);
      }
    };
    
    loadData();
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
  const [incorrectOptionId, setIncorrectOptionId] = useState<string | null>(null);
  const explanationVoiceRef = useRef<ExplanationVoicePlayerRef>(null);

  const startChallenge = () => {
    const distractors = allCharacters
      .filter(c => c.id !== characterData.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    const options = [characterData, ...distractors].sort(() => 0.5 - Math.random());
    setChallengeOptions(options);
    setChallengeStatus('idle');
    setIncorrectOptionId(null);
    setChallengeModalOpen(true);
  };

  const handleOptionClick = (selectedId: string) => {
    // Only prevent clicks if already correct (to avoid multiple success animations)
    if (challengeStatus === 'correct') return;

    if (selectedId === characterData.id) {
      setChallengeStatus('correct');
      setShowCelebration(true); // Trigger animation
    } else {
      setChallengeStatus('incorrect');
      setIncorrectOptionId(selectedId);
      // Reset incorrect feedback after 1.5 seconds to encourage retry
      setTimeout(() => {
        setChallengeStatus('idle');
        setIncorrectOptionId(null);
      }, 1500);
    }
  };

  const handleAnimationComplete = () => {
    // Update total star count
    const totalStarCount = parseInt(localStorage.getItem('hanzi-challenge-success') || '0', 10) + 1;
    localStorage.setItem('hanzi-challenge-success', totalStarCount.toString());

    // Update character-specific star count
    const successfulCharacters: { id: string; character: string; count: number; }[] = JSON.parse(localStorage.getItem('hanzi-successful-characters') || '[]');
    const charIndex = successfulCharacters.findIndex(c => c.id === characterData.id);

    if (charIndex > -1) {
      successfulCharacters[charIndex].count += 1;
    } else {
      successfulCharacters.push({
        id: characterData.id,
        character: characterData.character,
        count: 1,
      });
    }
    localStorage.setItem('hanzi-successful-characters', JSON.stringify(successfulCharacters));

    // Dispatch events to update UI
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'hanzi-challenge-success',
        newValue: totalStarCount.toString(),
    }));
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'hanzi-successful-characters',
        newValue: JSON.stringify(successfulCharacters),
    }));

    setShowCelebration(false);
    setChallengeModalOpen(false);
    setChallengeStatus('idle');
  };

  const closeChallenge = () => {
    setChallengeModalOpen(false);
    setChallengeStatus('idle');
    setIncorrectOptionId(null);
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

    // 自动播放说明文字
    setTimeout(() => {
      let explanation = '';
      if (stageIndex === -2) {
        explanation = `我们生活中看到的"${characterData.character}"是这个样子的。`;
      } else if (stageIndex >= 0 && characterData.evolutionStages[stageIndex]) {
        explanation = characterData.evolutionStages[stageIndex].explanation;
      }
      
      if (explanation && explanationVoiceRef.current) {
        explanationVoiceRef.current.speak(explanation);
      }
    }, 800);
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

      {/* 主要内容区域 - 上下布局 */}
      <div className="w-full h-full flex-grow flex flex-col gap-6">
        
        {/* 上部分：字符展示区 (70%高度) */}
        <div className="w-full h-[70%] flex justify-center items-center rounded-2xl bg-white shadow-lg overflow-hidden p-8">
          {activeStage === -2 ? (
            <motion.img 
              key={currentImageUrl}
              src={currentImageUrl} 
              alt="实物" 
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          ) : (
            <motion.p 
              key={activeStage}
              className="text-8xl md:text-9xl font-bold text-stone-800" 
              style={{ fontFamily: characterData.evolutionStages[activeStage]?.fontFamily }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {characterData.evolutionStages[activeStage]?.scriptText}
            </motion.p>
          )}
        </div>

        {/* 下部分：信息展示区 (30%高度) */}
        <div className="w-full h-[30%] bg-stone-50 rounded-2xl shadow-lg p-6">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">
            
            {/* 汉字信息卡片 */}
            {activeStage >= -2 && (
              <AnimatePresence>
                <motion.div
                  key="character-info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="w-full md:w-1/3 bg-white rounded-xl shadow-sm p-6 text-center flex flex-col justify-center"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <p className="text-3xl md:text-4xl font-bold text-stone-800">{characterData.character}</p>
                    <VoicePlayer text={characterData.character} size="md" preferredCNVoice />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-lg md:text-xl text-stone-600">{characterData.pinyin}</p>
                    <VoicePlayer text={characterData.pinyin} size="sm" />
                  </div>
                  <p className="text-base md:text-lg text-stone-500">{characterData.meaning}</p>
                </motion.div>
              </AnimatePresence>
            )}
            
            {/* 解释说明卡片 */}
            <motion.div 
              key={activeStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`${activeStage >= -2 ? 'w-full md:w-1/2' : 'w-full md:w-2/3'} bg-white rounded-xl shadow-sm p-6 flex items-center justify-center gap-3`}
            >
              <p className="text-stone-600 text-base md:text-lg text-center leading-relaxed flex-1">
                {getExplanation()}
              </p>
              <ExplanationVoicePlayer 
                text={getExplanation()} 
                ref={explanationVoiceRef}
                size="md"
              />
            </motion.div>
            
            {/* 游戏按钮 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`${activeStage >= -2 ? 'w-full md:w-1/6' : 'w-full md:w-1/3'} flex items-center justify-center`}
            >
              <motion.button 
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={startChallenge}
                className="w-full h-full min-h-[80px] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-md flex flex-col items-center justify-center gap-2 text-sm md:text-base transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                <span>开始小游戏</span>
              </motion.button>
            </motion.div>
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
            animate={{ 
              opacity: challengeStatus === 'correct' ? 0 : 1,
              backgroundColor: challengeStatus === 'correct' ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.6)'
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: challengeStatus === 'correct' ? 1.5 : 0.3 }}
            className="fixed inset-0 flex justify-center items-center z-50 p-4"
            onClick={closeChallenge}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className={`w-full max-w-4xl rounded-2xl p-8 shadow-xl relative ${
                challengeStatus === 'correct' ? 'bg-transparent' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {challengeStatus === 'correct' ? (
                <div className="w-full h-64 flex justify-center items-center bg-transparent">
                   {/* Now the celebration animation is handled outside the modal */}
                </div>
              ) : (
                <>
                  <img src={characterData.assets.realObjectImage} alt={characterData.character} className="w-full h-64 object-contain rounded-lg mb-6 bg-stone-50"/>
                  <p className="text-center text-3xl font-bold text-stone-700 mb-8">哪一个是"{characterData.character}"字？</p>
                  {challengeStatus === 'incorrect' && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-lg text-amber-600 mb-4 font-medium"
                    >
                      💭 再想想看，你一定可以的！
                    </motion.p>
                  )}
                  <div className="grid grid-cols-3 gap-6">
                    {challengeOptions.map(option => {
                      const isIncorrect = incorrectOptionId === option.id;
                      const isWrongOption = challengeStatus === 'incorrect' && option.id !== characterData.id && incorrectOptionId !== option.id;
                      
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleOptionClick(option.id)}
                          whileTap={{ scale: 0.9 }}
                          animate={isIncorrect ? {
                            x: [0, -8, 8, -8, 8, 0],
                            backgroundColor: ['#fecaca', '#ef4444', '#fecaca']
                          } : {}}
                          transition={isIncorrect ? {
                            x: { duration: 0.5, ease: "easeInOut" },
                            backgroundColor: { duration: 1.5, ease: "easeInOut" }
                          } : {}}
                          className={`p-6 rounded-2xl text-5xl font-bold flex justify-center items-center shadow-md transition-all duration-300 ${
                            isIncorrect 
                              ? 'bg-red-300 text-red-800 shadow-red-200' 
                              : isWrongOption 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-stone-100 hover:bg-amber-200 hover:shadow-lg'
                          }`}
                          disabled={isWrongOption}
                        >
                          {option.character}
                        </motion.button>
                      );
                    })}
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