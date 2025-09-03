'use client'

import { useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface VoicePlayerProps {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  autoPlay?: boolean,
  preferredCNVoice?: boolean,
}

const VoicePlayer = ({ text, className = '', size = 'md', autoPlay = false, preferredCNVoice = false }: VoicePlayerProps) => {
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
    utterance.rate = 0.8 // 适合儿童的语速
    utterance.pitch = 1.1 // 稍高音调，更亲和
    utterance.volume = 0.9

    // 尝试选择更自然的中文语音
    const voices = speechSynthesis.getVoices()
    const chineseVoices = voices.filter(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    )
    
    if (preferredCNVoice) {
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
    }

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

  const handleClick = useCallback(() => {
    if (!isSupported) return
    speak(text)
  }, [text, speak, isSupported])

  // 自动播放
  useEffect(() => {
    if (autoPlay && text && isSupported) {
      const timer = setTimeout(() => speak(text), 500)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, text, isSupported, speak])

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
      className={`${sizeClasses[size]} rounded-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 flex items-center justify-center transition-all duration-200 group ${className}`}
      title={`播放"${text}"的发音`}
      disabled={isPlaying}
    >
      <Volume2 
        size={iconSizes[size]} 
        className={`text-blue-600 transition-all duration-200 ${
          isPlaying 
            ? 'animate-pulse scale-110' 
            : 'group-hover:scale-110 group-active:scale-95'
        }`} 
      />
    </button>
  )
}

export default VoicePlayer