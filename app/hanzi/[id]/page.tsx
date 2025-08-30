'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, RotateCcw } from 'lucide-react';
import LottiePlayer, { LottiePlayerRef } from '@/components/LottiePlayer';

// --- Simple Error Boundary to catch rendering errors ---
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("[DEBUG_BOUNDARY] Uncaught error in child component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-red-100 text-red-800">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <pre className="mt-4 p-4 bg-red-200 rounded-md">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- Type Definitions ---
interface EvolutionStage {
  scriptName: string;
  timestamp: number;
  narrationAudio: string;
  explanation: string;
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
    lottieAnimation: string;
  };
  evolutionStages: EvolutionStage[];
}

// --- Main Page Component (with logging) ---
export default function HanziDetailPage() {
  console.log('[DEBUG_PARENT] HanziDetailPage rendering or re-rendering.');
  const params = useParams();
  const id = params.id as string;
  const [characterData, setCharacterData] = useState<HanziData | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('[DEBUG_PARENT] Raw params:', params);
  console.log('[DEBUG_PARENT] Extracted id:', id);
  console.log('[DEBUG_PARENT] Type of id:', typeof id);
  console.log(`[DEBUG_PARENT] Current state: id=${id}, loading=${loading}, characterData is ${characterData ? 'set' : 'null'}`);

  console.log('[DEBUG_PARENT] About to define useEffect with dependency:', id);
  
  // Simple test useEffect
  useEffect(() => {
    console.log('[DEBUG_PARENT] *** SIMPLE useEffect TRIGGERED ***');
  });
  
  // Main useEffect with dependency
  useEffect(() => {
    console.log(`[DEBUG_PARENT] *** MAIN useEffect TRIGGERED for id: ${id} ***`);
    
    if (!id) {
      console.log('[DEBUG_PARENT] id is missing, returning.');
      return;
    }
    
    console.log('[DEBUG_PARENT] Starting data fetch process');
    setLoading(true);
    
    fetch('/data/hanzi-data.json')
      .then(res => {
        console.log('[DEBUG_PARENT] Fetch response received, status:', res.status);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then(allData => {
        console.log('[DEBUG_PARENT] JSON parsed, searching for id:', id);
        const data = allData.find((c: HanziData) => c.id === id);
        if (data) {
          console.log('[DEBUG_PARENT] Character data found:', data.character);
          setCharacterData(data);
        } else {
          console.error(`[DEBUG_PARENT] Character data for id '${id}' NOT FOUND`);
          setCharacterData(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('[DEBUG_PARENT] Fetch failed:', err);
        setLoading(false);
      });
  }, [id]);
  
  console.log('[DEBUG_PARENT] useEffects defined, continuing with render logic');

  if (loading) {
    console.log("[DEBUG_PARENT] Render: returning 'Loading' view.");
    return <div className="w-screen h-screen flex justify-center items-center bg-amber-50">Loading Character...</div>;
  }

  if (!characterData) {
    console.log("[DEBUG_PARENT] Render: returning 'Not Found' view.");
    return <div className="w-screen h-screen flex justify-center items-center bg-amber-50">Character not found. Please check the ID.</div>;
  }

  console.log('[DEBUG_PARENT] Render: returning <EvolutionPlayer />');
  return (
    <ErrorBoundary>
      <EvolutionPlayer characterData={characterData} />
    </ErrorBoundary>
  );
}

// --- Core Player Component (Ultimate Debug Mode) ---
const EvolutionPlayer = ({ characterData }: { characterData: HanziData }) => {
  const [activeStage, setActiveStage] = useState(-1);
  const lottiePlayerRef = useRef<LottiePlayerRef>(null);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const internalStateForDebug = useRef({});
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);

  useEffect(() => {
    console.log(`[DEBUG_CHILD] EvolutionPlayer useEffect for ${characterData.id}`);
    if (!narrationRef.current) {
      console.log('[DEBUG_CHILD] Initializing Audio element');
      narrationRef.current = new Audio();
    }
  }, [characterData.id]);

  const handleAnimationLoad = () => {
    console.log('[DEBUG_CHILD] Lottie animation loaded via LottiePlayer');
    setIsAnimationLoaded(true);
  };

  const handleAnimationError = (error: Error) => {
    console.error('[DEBUG_CHILD] Lottie animation error:', error);
  };

  const handleAnimationComplete = () => {
    console.log('[DEBUG_CHILD] Animation completed');
  };

  const handleReplay = () => {
    if (lottiePlayerRef.current) {
      lottiePlayerRef.current.stop();
      setTimeout(() => {
        lottiePlayerRef.current?.play();
      }, 100);
      setActiveStage(-1);
    }
  };

  useEffect(() => {
      const interval = setInterval(() => {
          internalStateForDebug.current = {
              hasLottiePlayer: !!lottiePlayerRef.current,
              isLoaded: isAnimationLoaded,
              element: lottiePlayerRef.current?.getElement() ? 'exists' : 'null',
          };
      }, 500);
      return () => clearInterval(interval);
  }, [isAnimationLoaded]);

  console.log(`[DEBUG_CHILD] Rendering EvolutionPlayer for ${characterData.id}`);
  return (
    <div className="w-screen h-screen bg-stone-100 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Controls */}
        <div className="absolute top-5 left-5 z-10 flex gap-2">
            <Link href="/hanzi" passHref>
                <motion.button whileTap={{scale: 0.9}} className="p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-md">
                    <Home className="w-6 h-6 text-stone-700"/>
                </motion.button>
            </Link>
            <motion.button onClick={handleReplay} whileTap={{scale: 0.9}} className="p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-md">
                <RotateCcw className="w-6 h-6 text-stone-700"/>
            </motion.button>
        </div>

        {/* On-screen debug info */}
        {/* <div className="absolute top-5 right-5 bg-black/50 text-white p-2 rounded-md text-xs font-mono">
            <pre>DEBUG_STATE: {JSON.stringify(internalStateForDebug.current, null, 2)}</pre>
        </div> */}

        {/* Main Animation Stage */}
        <div className="w-full max-w-4xl aspect-video" style={{ width: '800px', height: '450px' }}>
          <LottiePlayer
            ref={lottiePlayerRef}
            src={characterData.assets.lottieAnimation}
            width="100%"
            height="100%"
            loop={false}
            autoplay={true}
            onLoad={handleAnimationLoad}
            onError={handleAnimationError}
            onComplete={handleAnimationComplete}
          />
        </div>

        {/* Progress Bar / Timeline */}
        <div className="absolute bottom-10 w-full max-w-4xl flex justify-between items-end px-4">
            {characterData.evolutionStages.map((stage, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                    <motion.div 
                        animate={{ scale: activeStage === index ? 1.2 : 1, opacity: activeStage === index ? 1 : 0.7 }}
                        className="px-4 py-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                    >
                        <p className="text-xl font-serif text-stone-800">{stage.scriptName}</p>
                    </motion.div>
                    <div className={`w-1 h-4 ${activeStage >= index ? 'bg-orange-400' : 'bg-stone-300'} rounded-full`}></div>
                </div>
            ))}
        </div>
        
        {/* Explanation Text */}
        <div className="absolute bottom-24 w-full max-w-2xl text-center">
            <p className="text-stone-600 text-lg">
                {activeStage !== -1 && characterData.evolutionStages[activeStage] ? characterData.evolutionStages[activeStage].explanation : ''}
            </p>
        </div>
    </div>
  );
};