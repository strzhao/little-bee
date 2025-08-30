'use client'

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface ExplanationVoicePlayerProps {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface ExplanationVoicePlayerRef {
  speak: (text: string) => void
}

const ExplanationVoicePlayer = forwardRef<ExplanationVoicePlayerRef, ExplanationVoicePlayerProps>(
  ({ text, className = '', size = 'md' }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isSupported, setIsSupported] = useState(true)

    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    }

    const iconSizes = {
      sm: 12,
      md: 16,
      lg: 20
    }

    const speak = useCallback((textToSpeak: string) => {
      // 检查浏览器支持
      if (!('speechSynthesis' in window)) {
        setIsSupported(false)
        console.warn('浏览器不支持语音合成功能')
        return
      }

      // 停止当前播放
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      
      // 设置中文语音参数
      utterance.lang = 'zh-CN'
      utterance.rate = 0.7 // 稍慢的语速，适合说明文字
      utterance.pitch = 1.0 // 自然音调
      utterance.volume = 0.9

      // 播放状态管理
      utterance.onstart = () => {
        setIsPlaying(true)
      }

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utterance.onerror = (event) => {
        console.error('语音播放错误:', event.error)
        setIsPlaying(false)
        setIsSupported(false)
      }

      speechSynthesis.speak(utterance)
    }, [])

    // 暴露speak方法给父组件
    useImperativeHandle(ref, () => ({
      speak
    }), [speak])

    const handleClick = useCallback(() => {
      if (!isSupported) return
      speak(text)
    }, [text, speak, isSupported])

    if (!isSupported) {
      return (
        <button 
          className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center cursor-not-allowed opacity-50 ${className}`}
          disabled
          title="浏览器不支持语音播放"
        >
          <VolumeX size={iconSizes[size]} className="text-gray-400" />
        </button>
      )
    }

    return (
      <button 
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full bg-amber-50 hover:bg-amber-100 active:bg-amber-200 flex items-center justify-center transition-all duration-200 group flex-shrink-0 ${className}`}
        title={`播放说明文字`}
        disabled={isPlaying}
      >
        <Volume2 
          size={iconSizes[size]} 
          className={`text-amber-600 transition-all duration-200 ${
            isPlaying ? 'animate-pulse' : 'group-hover:scale-110'
          }`}
        />
      </button>
    )
  }
)

ExplanationVoicePlayer.displayName = 'ExplanationVoicePlayer'

export default ExplanationVoicePlayer