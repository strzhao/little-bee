'use client'

import { useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface VoicePlayerProps {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  autoPlay?: boolean
}

const VoicePlayer = ({ text, className = '', size = 'md', autoPlay = false }: VoicePlayerProps) => {
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
    setIsPlaying(true)

    // 拼音拆分播放逻辑
    const playPinyinSequence = async (pinyin: string) => {
      // 选择更自然的中文语音（保持拼音教学特色）
      const voices = speechSynthesis.getVoices()
      const chineseVoices = voices.filter(voice => 
        voice.lang.includes('zh') || voice.lang.includes('CN')
      )
      
      // 优先选择适合拼音教学的女性声音
      const preferredVoice = chineseVoices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('女') ||
        voice.name.includes('Xiaoxiao') ||
        voice.name.includes('Yaoyao') ||
        voice.name.includes('Tingting')
      ) || chineseVoices[0]

      // 拆分拼音为声母、韵母等部分进行教学
       const parts: string[] = []
      
      // 识别声母
      const initials = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w']
      let remaining = pinyin.toLowerCase()
      
      // 找到声母
      for (const initial of initials.sort((a, b) => b.length - a.length)) {
        if (remaining.startsWith(initial)) {
          parts.push(initial)
          remaining = remaining.slice(initial.length)
          break
        }
      }
      
      // 剩余部分作为韵母
      if (remaining) {
        parts.push(remaining)
      }
      
      // 最后播放完整拼音
      parts.push(pinyin)

      // 逐个播放每个部分
      for (let i = 0; i < parts.length; i++) {
        await new Promise<void>((resolve) => {
           // 为拼音部分添加中文语音标记，确保按拼音发音
           let textToSpeak = parts[i]
           
           // 如果是声母或韵母，添加拼音语音提示
           if (i < parts.length - 1) {
             // 对于声母和韵母，使用拼音发音方式
             textToSpeak = parts[i] + '音'
           }
           
           const utterance = new SpeechSynthesisUtterance(textToSpeak)
           
           // 设置拼音教学语音参数
           utterance.lang = 'zh-CN'
           utterance.rate = 0.8 // 适合儿童的语速
           utterance.pitch = 1.1 // 稍高音调，更亲和
           utterance.volume = 0.9
           
           if (preferredVoice) {
             utterance.voice = preferredVoice
           }

           utterance.onend = () => {
             resolve()
           }

           utterance.onerror = (event) => {
             console.error('语音播放错误:', event.error)
             resolve()
           }

           // 确保语音列表已加载
           if (speechSynthesis.getVoices().length === 0) {
             speechSynthesis.addEventListener('voiceschanged', () => {
               speechSynthesis.speak(utterance)
             }, { once: true })
           } else {
             speechSynthesis.speak(utterance)
           }
         })
        
        // 在部分之间添加短暂停顿
        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      setIsPlaying(false)
    }

    // 开始播放拼音序列
    playPinyinSequence(textToSpeak).catch((error) => {
      console.error('拼音播放错误:', error)
      setIsPlaying(false)
    })
  }, [])

  const handleClick = useCallback(() => {
    if (!isSupported) return
    speak(text)
  }, [text, speak, isSupported])

  // 自动播放
  useState(() => {
    if (autoPlay && text && isSupported) {
      const timer = setTimeout(() => speak(text), 500)
      return () => clearTimeout(timer)
    }
  })

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