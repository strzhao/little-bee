'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles } from 'lucide-react';

// 导入组件
import CelebrationAnimation from '@/components/hanzi/CelebrationAnimation';
import VoicePlayer from '@/components/hanzi/VoicePlayer';
import ExplanationVoicePlayer, { ExplanationVoicePlayerRef } from '@/components/hanzi/ExplanationVoicePlayer';
import SuccessStars from '@/components/hanzi/SuccessStars';

// 导入状态管理
import { useHanziState, useLearningProgress } from '@/lib/hooks/use-hanzi-state';
import { HanziCharacter } from '@/lib/atoms/hanzi-atoms';

// 个性化解释配置类型
interface PersonalizedExplanationsConfig {
  realObjectExplanations: Record<string, string>;
  characterExplanations: Record<string, string>;
  fallbackTemplates: {
    realObject: string;
    character: string;
  };
}

// 类型定义
interface EvolutionStage {
  scriptName: string;
  timestamp: number;
  narrationAudio: string;
  explanation: string;
  scriptText: string;
  fontFamily: string;
  cardColor: string;
}

interface HanziData {
  id: string;
  character: string;
  pinyin: string;
  theme: string;
  meaning: string;
  emoji: string;
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

// 详情页视图组件
export default function HanziDetailView({ 
  characterId, 
  onNavigateHome 
}: { 
  characterId: string;
  onNavigateHome: () => void;
}) {
  // 状态管理
  const { 
    currentHanzi, 
    allHanzi, 
    loadingState, 
    loadCharacterById, 
    loadAllCharacters
  } = useHanziState();
  
  const { completeCharacterLearning } = useLearningProgress();
  
  // 本地状态
  const [loading, setLoading] = useState(true);
  const [characterData, setCharacterData] = useState<HanziData | null>(null);
  const [allCharacters, setAllCharacters] = useState<HanziData[]>([]);

  // 加载汉字数据
  useEffect(() => {
    if (!characterId) return;
    
    const loadData = async () => {
      try {
        // 加载所有汉字数据（如果还没有加载）
        await loadAllCharacters();
        
        // 加载特定汉字
        const character = await loadCharacterById(characterId);
        
        if (character) {
          // 转换数据格式
          const hanziData: HanziData = {
            id: character.id,
            character: character.character,
            pinyin: character.pinyin,
            theme: character.theme || '',
            meaning: character.meaning,
            emoji: character.emoji || '',
            category: character.category,
            learningStage: character.learningStage,
            assets: {
              pronunciationAudio: character.assets.pronunciationAudio,
              mainIllustration: character.assets.mainIllustration,
              realObjectImage: character.assets.realObjectImage,
              realObjectCardColor: character.assets.realObjectCardColor,
              lottieAnimation: character.assets.lottieAnimation
            },
            evolutionStages: character.evolutionStages.map(stage => ({
              scriptName: stage.scriptName,
              timestamp: stage.timestamp,
              narrationAudio: stage.narrationAudio,
              explanation: stage.explanation,
              scriptText: stage.scriptText,
              fontFamily: stage.fontFamily,
              cardColor: stage.cardColor
            }))
          };
          
          setCharacterData(hanziData);
          
          // 转换所有汉字数据
          const allHanziData: HanziData[] = allHanzi.map(char => ({
            id: char.id,
            character: char.character,
            pinyin: char.pinyin,
            theme: char.theme || '',
            meaning: char.meaning,
            emoji: char.emoji || '',
            category: char.category || '',
            learningStage: char.learningStage || '',
            assets: {
              pronunciationAudio: char.assets.pronunciationAudio,
              mainIllustration: char.assets.mainIllustration,
              realObjectImage: char.assets.realObjectImage,
              realObjectCardColor: char.assets.realObjectCardColor,
              lottieAnimation: char.assets.lottieAnimation
            },
            evolutionStages: char.evolutionStages.map(stage => ({
              scriptName: stage.scriptName,
              timestamp: stage.timestamp,
              narrationAudio: stage.narrationAudio,
              explanation: stage.explanation,
              scriptText: stage.scriptText,
              fontFamily: stage.fontFamily,
              cardColor: stage.cardColor
            }))
          }));
          
          setAllCharacters(allHanziData);
          
          // 预加载字体
          const fontFamilies = hanziData.evolutionStages.map(stage => stage.fontFamily);
          const uniqueFonts = [...new Set(fontFamilies)];
          
          uniqueFonts.forEach(fontFamily => {
            if (fontFamily && !document.fonts.check(`16px "${fontFamily}"`)) {
              const preloadDiv = document.createElement('div');
              preloadDiv.style.fontFamily = fontFamily;
              preloadDiv.style.position = 'absolute';
              preloadDiv.style.left = '-9999px';
              preloadDiv.style.visibility = 'hidden';
              preloadDiv.textContent = hanziData.character;
              document.body.appendChild(preloadDiv);
              
              // 移除预加载元素
              setTimeout(() => {
                if (preloadDiv.parentNode) {
                  preloadDiv.parentNode.removeChild(preloadDiv);
                }
              }, 100);
            }
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load character data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, [characterId, loadCharacterById, loadAllCharacters, allHanzi]);

  if (loadingState.isLoading || loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-amber-50">
        <div className="text-xl text-gray-600">加载汉字中...</div>
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-amber-50">
        <div className="text-xl text-gray-600">汉字未找到</div>
      </div>
    );
  }

  return (
    <EvolutionPlayer 
      characterData={characterData} 
      allCharacters={allCharacters}
      onNavigateHome={onNavigateHome}
    />
  );
}

// 核心播放器组件
const EvolutionPlayer = ({ 
  characterData, 
  allCharacters, 
  onNavigateHome 
}: { 
  characterData: HanziData;
  allCharacters: HanziData[];
  onNavigateHome: () => void;
}) => {
  const { completeCharacterLearning } = useLearningProgress();
  const [activeStage, setActiveStage] = useState(-2); // -2 for Real Object
  const [currentImageUrl, setCurrentImageUrl] = useState(characterData.assets.realObjectImage);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [challengeImageError, setChallengeImageError] = useState(false);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const [isChallengeModalOpen, setChallengeModalOpen] = useState(false);
  const [challengeOptions, setChallengeOptions] = useState<HanziData[]>([]);
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const [incorrectOptionId, setIncorrectOptionId] = useState<string | null>(null);
  const explanationVoiceRef = useRef<ExplanationVoicePlayerRef>(null);
  const [explanationsConfig, setExplanationsConfig] = useState<PersonalizedExplanationsConfig | null>(null);

  // 加载个性化解释配置
  useEffect(() => {
    const loadExplanationsConfig = async () => {
      try {
        const response = await fetch('/data/configs/personalized-explanations.json');
        if (response.ok) {
          const config = await response.json();
          setExplanationsConfig(config);
        }
      } catch (error) {
        console.error('Failed to load personalized explanations config:', error);
      }
    };
    
    loadExplanationsConfig();
  }, []);

  const startChallenge = () => {
    const distractors = allCharacters
      .filter(c => c.id !== characterData.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    const options = [characterData, ...distractors].sort(() => 0.5 - Math.random());
    setChallengeOptions(options);
    setChallengeStatus('idle');
    setIncorrectOptionId(null);
    setChallengeImageError(false);
    setChallengeModalOpen(true);
    
    // 延迟0.8秒播放语音引导，确保弹框动画完成
    setTimeout(() => {
      // 停止其他可能正在播放的音频，避免冲突
      if (narrationRef.current) {
        narrationRef.current.pause();
      }
      
      const guideText = `请找出刚才看到的${characterData.character}字，点击下面正确的选项`;
      if (explanationVoiceRef.current) {
        explanationVoiceRef.current.speak(guideText);
      }
    }, 800);
  };

  // 语音反馈语料池
  const getRandomFeedback = (type: 'success' | 'error') => {
    const successMessages = [
      "太棒了！你答对了！",
      "真聪明！完全正确！",
      "做得很好！继续加油！",
      "哇，你真厉害！",
      "答对了！你学得真快！",
      "非常棒！你记住了！",
      "太好了！你找到了正确答案！",
      "真不错！你很仔细！"
    ];
    
    const errorMessages = [
      "这个不对哦，再试试其他的吧！",
      "没关系，再仔细看看！",
      "不是这个呢，换一个试试！",
      "再想想，你一定能找到的！",
      "别着急，慢慢来！",
      "试试别的选项吧！",
      "没关系，学习需要耐心！",
      "再看看，哪个更像呢？"
    ];
    
    const messages = type === 'success' ? successMessages : errorMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleOptionClick = (selectedId: string) => {
    // Only prevent clicks if already correct (to avoid multiple success animations)
    if (challengeStatus === 'correct') return;

    if (selectedId === characterData.id) {
      setChallengeStatus('correct');
      setShowCelebration(true); // Trigger animation
      
      // 播放成功赞赏语音
      const successFeedback = getRandomFeedback('success');
      if (explanationVoiceRef.current) {
        explanationVoiceRef.current.speak(successFeedback);
      }
    } else {
      setChallengeStatus('incorrect');
      setIncorrectOptionId(selectedId);
      
      // 播放错误反馈语音
      const errorFeedback = getRandomFeedback('error');
      if (explanationVoiceRef.current) {
        explanationVoiceRef.current.speak(errorFeedback);
      }
      
      // Reset incorrect feedback after 1.5 seconds to encourage retry
      setTimeout(() => {
        setChallengeStatus('idle');
        setIncorrectOptionId(null);
      }, 1500);
    }
  };

  const handleAnimationComplete = () => {
    // Use new Jotai-based learning progress system
    // Each successful challenge earns 1 star
    completeCharacterLearning(characterData.id, characterData.character, 1);

    setShowCelebration(false);
    setChallengeModalOpen(false);
    setChallengeStatus('idle');
  };

  const closeChallenge = () => {
    setChallengeModalOpen(false);
    setChallengeStatus('idle');
    setIncorrectOptionId(null);
  };

  // 根据汉字含义生成个性化语音内容
  const generatePersonalizedExplanation = (character: HanziData) => {
    if (!explanationsConfig) {
      // 配置未加载时使用默认解释
      return `我们生活中看到的"${character.character}"是这个样子的。这个字的意思是${character.meaning}，让我们一起来认识它吧！`;
    }

    // 优先使用meaning映射的解释
    const meaningExplanation = explanationsConfig.realObjectExplanations[character.meaning];
    if (meaningExplanation) {
      return meaningExplanation.replace('{character}', character.character);
    }

    // 使用fallback模板
    return explanationsConfig.fallbackTemplates.realObject
      .replace('{character}', character.character)
      .replace('{meaning}', character.meaning);
  };

  useEffect(() => {
    setCurrentImageUrl(characterData.assets.realObjectImage);
    setImageLoadError(false);
    setActiveStage(-2);
  }, [characterData]);

  // 配置加载完成后播放个性化解释
  useEffect(() => {
    if (explanationsConfig) {
      // 配置加载完成后自动播放实物按钮的个性化解释
      setTimeout(() => {
        const explanation = generatePersonalizedExplanation(characterData);
        if (explanationVoiceRef.current) {
          explanationVoiceRef.current.speak(explanation);
        }
      }, 1000);
    }
  }, [explanationsConfig, characterData]);

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
        explanation = generatePersonalizedExplanationText(characterData.character, characterData.meaning);
      } else if (stageIndex >= 0 && characterData.evolutionStages[stageIndex]) {
        explanation = characterData.evolutionStages[stageIndex].explanation;
      }
      
      if (explanation && explanationVoiceRef.current) {
        explanationVoiceRef.current.speak(explanation);
      }
    }, 800);
  };
  
  const generatePersonalizedExplanationText = (character: string, meaning: string) => {
    if (!explanationsConfig) {
      // 配置未加载时使用默认解释
      return `"${character}"字的意思是${meaning}。古人通过观察生活中的事物，创造了这个汉字来表达这个概念。`;
    }

    // 优先使用meaning映射的解释
    const meaningExplanation = explanationsConfig.characterExplanations[meaning];
    if (meaningExplanation) {
      return meaningExplanation.replace('{character}', character);
    }

    // 使用fallback模板
    return explanationsConfig.fallbackTemplates.character
      .replace('{character}', character)
      .replace('{meaning}', meaning);
  };

  const getExplanation = () => {
    if (activeStage === -2) {
      return generatePersonalizedExplanationText(characterData.character, characterData.meaning);
    }
    if (activeStage >= 0 && characterData.evolutionStages[activeStage]) {
      return characterData.evolutionStages[activeStage].explanation;
    }
    return '点击左侧的彩色圆圈，开始探索它的故事吧！';
  };

  return (
    <div className="w-screen h-screen bg-stone-100 flex flex-col md:flex-row p-4 sm:p-6 md:p-8 gap-6 md:gap-8">
      
      <div className="w-full md:w-auto flex flex-col gap-4 flex-shrink-0 items-center">
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={onNavigateHome}
          className="w-28 p-3 bg-white/70 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5 text-stone-700"/>
          <span className="font-semibold">首页</span>
        </motion.button>

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
            imageLoadError ? (
              <motion.div
                key="emoji-fallback"
                className="text-9xl flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span>{characterData.emoji}</span>
                <p className="text-2xl text-gray-500 font-medium">实物图片</p>
              </motion.div>
            ) : (
              <motion.img 
                key={currentImageUrl}
                src={currentImageUrl} 
                alt="实物" 
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                onError={() => setImageLoadError(true)}
              />
            )
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
                  {challengeImageError ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center rounded-lg mb-6 bg-stone-50">
                      <span className="text-6xl mb-2">{characterData.emoji}</span>
                      <p className="text-lg text-gray-500 font-medium">实物图片</p>
                    </div>
                  ) : (
                    <img 
                      src={characterData.assets.realObjectImage} 
                      alt={characterData.character} 
                      className="w-full h-64 object-contain rounded-lg mb-6 bg-stone-50"
                      onError={() => setChallengeImageError(true)}
                    />
                  )}
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

      {/* 星星计数器 */}
      <SuccessStars />
    </div>
  );
};