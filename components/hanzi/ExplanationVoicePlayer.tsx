'use client'

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface ExplanationVoicePlayerProps {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface ExplanationVoicePlayerRef {
  speak: (text: string, onComplete?: () => void) => void
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

    const speak = useCallback((textToSpeak: string, onComplete?: () => void) => {
      // 检查浏览器支持
      if (!('speechSynthesis' in window)) {
        setIsSupported(false)
        console.warn('浏览器不支持语音合成功能')
        return
      }

      // 停止当前播放
      speechSynthesis.cancel()

      // 处理文本，添加自然停顿
      const processedText = textToSpeak
        .replace(/，/g, '，') // 逗号后稍作停顿
        .replace(/。/g, '。') // 句号后停顿
        .replace(/！/g, '！') // 感叹号后停顿
        .replace(/？/g, '？') // 问号后停顿
        .replace(/：/g, '：') // 冒号后停顿

      const utterance = new SpeechSynthesisUtterance(processedText)
      
      // 设置更自然的老师语音参数
      utterance.lang = 'zh-CN'
      utterance.rate = 0.75 // 老师讲课的适中语速
      utterance.pitch = 0.95 // 稍低沉稳的音调，更有权威感
      utterance.volume = 0.85 // 适中音量，不会太突兀

      // 尝试选择更自然的中文语音
      const voices = speechSynthesis.getVoices()
      const chineseVoices = voices.filter(voice => 
        voice.lang.includes('zh') || voice.lang.includes('CN')
      )
      
      // 优先选择女性声音（通常更适合教学）
      const preferredVoice = chineseVoices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('女') ||
        voice.name.includes('Xiaoxiao') ||
        voice.name.includes('Yaoyao')
      ) || chineseVoices[0]
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      // 播放状态管理
      utterance.onstart = () => {
        setIsPlaying(true)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        onComplete?.()
      }

      utterance.onerror = (event) => {
        console.error('语音播放错误:', event.error)
        setIsPlaying(false)
        onComplete?.() // Also call onComplete on error to avoid getting stuck
      }

      // 确保语音列表已加载
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          speechSynthesis.speak(utterance)
        }, { once: true })
      } else {
        speechSynthesis.speak(utterance)
      }
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