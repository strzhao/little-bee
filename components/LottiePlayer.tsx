'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

// DotLottie Web Component 类型定义
interface DotLottieElement extends HTMLElement {
  play?: () => void;
  pause?: () => void;
  stop?: () => void;
  seek?: (frame: number) => void;
  setSpeed?: (speed: number) => void;
}

interface LottiePlayerProps {
  src: string;
  speed?: string | number;
  width?: number | string;
  height?: number | string;
  mode?: 'forward' | 'reverse' | 'bounce' | 'bounce-reverse';
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface LottiePlayerRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (frame: number) => void;
  setSpeed: (speed: number) => void;
  getElement: () => DotLottieElement | null;
}

const LottiePlayer = forwardRef<LottiePlayerRef, LottiePlayerProps>(
  ({
    src,
    speed = 1,
    width = 300,
    height = 300,
    mode = 'forward',
    loop = true,
    autoplay = true,
    className = '',
    style = {},
    onLoad,
    onError,
    onComplete
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dotlottieRef = useRef<DotLottieElement | null>(null);
    const isLoaded = useRef(false);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      play: () => {
        const element = dotlottieRef.current as any;
        element?.play?.();
      },
      pause: () => {
        const element = dotlottieRef.current as any;
        element?.pause?.();
      },
      stop: () => {
        const element = dotlottieRef.current as any;
        element?.stop?.();
      },
      seek: (frame: number) => {
        const element = dotlottieRef.current as any;
        element?.seek?.(frame);
      },
      setSpeed: (speed: number) => {
        const element = dotlottieRef.current as any;
        element?.setSpeed?.(speed);
      },
      getElement: () => dotlottieRef.current || null
    }), []);

    useEffect(() => {
      const loadAndCreateDotLottie = async () => {
        if (!isLoaded.current && containerRef.current) {
          try {
            // 动态导入 dotlottie-wc 模块
            await import('@lottiefiles/dotlottie-wc');
            isLoaded.current = true;
            console.log('DotLottie Web Component loaded successfully');
            
            // 创建 dotlottie-wc 元素
            const dotlottieElement = document.createElement('dotlottie-wc') as DotLottieElement;
            dotlottieElement.setAttribute('src', src);
            dotlottieElement.setAttribute('speed', String(speed));
            dotlottieElement.setAttribute('mode', mode);
            
            // 设置尺寸
            const widthValue = typeof width === 'number' ? `${width}px` : width;
            const heightValue = typeof height === 'number' ? `${height}px` : height;
            dotlottieElement.style.width = widthValue;
            dotlottieElement.style.height = heightValue;
            
            if (loop) dotlottieElement.setAttribute('loop', '');
            if (autoplay) dotlottieElement.setAttribute('autoplay', '');
            
            // 添加事件监听器
            dotlottieElement.addEventListener('load', () => {
              console.log('Lottie animation loaded');
              onLoad?.();
            });
            
            dotlottieElement.addEventListener('error', (event: any) => {
              console.error('Lottie animation error:', event);
              onError?.(new Error('Failed to load Lottie animation'));
            });
            
            dotlottieElement.addEventListener('complete', () => {
              console.log('Lottie animation completed');
              onComplete?.();
            });
            
            // 清空容器并添加元素
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(dotlottieElement);
            dotlottieRef.current = dotlottieElement;
          } catch (error) {
            console.error('Failed to load DotLottie Web Component:', error);
            onError?.(error as Error);
          }
        }
      };

      loadAndCreateDotLottie();
    }, [src, speed, width, height, mode, loop, autoplay, onLoad, onError, onComplete]);

    return (
      <div 
        className={`lottie-player ${className}`}
        style={style}
        ref={containerRef}
      >
        {/* DotLottie Web Component will be inserted here */}
      </div>
    );
  }
);

LottiePlayer.displayName = 'LottiePlayer';

export default LottiePlayer;