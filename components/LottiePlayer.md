# LottiePlayer React 组件

一个基于 `@lottiefiles/dotlottie-wc` 的现代化 React Lottie 动画播放器组件。

## 特性

- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **React 集成** - 使用 forwardRef 和 useImperativeHandle
- ✅ **本地依赖** - 使用项目本地安装的依赖包
- ✅ **动态加载** - 按需加载 Web Component
- ✅ **播放控制** - 支持 play、pause、stop、seek 等方法
- ✅ **事件回调** - onLoad、onError、onComplete 等事件支持
- ✅ **灵活配置** - 支持多种播放模式和自定义属性

## 安装依赖

```bash
npm install @lottiefiles/dotlottie-wc
```

## 基本使用

```tsx
import LottiePlayer, { LottiePlayerRef } from '@/components/LottiePlayer';
import { useRef } from 'react';

function MyComponent() {
  const lottieRef = useRef<LottiePlayerRef>(null);

  const handlePlay = () => {
    lottieRef.current?.play();
  };

  const handlePause = () => {
    lottieRef.current?.pause();
  };

  return (
    <div>
      <LottiePlayer
        ref={lottieRef}
        src="/path/to/animation.json"
        width={300}
        height={300}
        autoplay
        loop
        onLoad={() => console.log('Animation loaded')}
        onComplete={() => console.log('Animation completed')}
      />
      <button onClick={handlePlay}>播放</button>
      <button onClick={handlePause}>暂停</button>
    </div>
  );
}
```

## 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | - | Lottie 动画文件路径（必需） |
| `width` | `number` | `300` | 动画宽度 |
| `height` | `number` | `300` | 动画高度 |
| `speed` | `number` | `1` | 播放速度 |
| `mode` | `'normal' \| 'bounce'` | `'normal'` | 播放模式 |
| `loop` | `boolean` | `true` | 是否循环播放 |
| `autoplay` | `boolean` | `true` | 是否自动播放 |
| `onLoad` | `() => void` | - | 动画加载完成回调 |
| `onError` | `(error: any) => void` | - | 动画加载错误回调 |
| `onComplete` | `() => void` | - | 动画播放完成回调 |

## Ref 方法

通过 ref 可以访问以下控制方法：

| 方法 | 参数 | 说明 |
|------|------|------|
| `play()` | - | 播放动画 |
| `pause()` | - | 暂停动画 |
| `stop()` | - | 停止动画 |
| `seek(time: number)` | `time` | 跳转到指定时间 |
| `setSpeed(speed: number)` | `speed` | 设置播放速度 |
| `getElement()` | - | 获取底层 DOM 元素 |

## 高级用法

### 控制动画播放

```tsx
function AdvancedPlayer() {
  const lottieRef = useRef<LottiePlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      lottieRef.current?.pause();
    } else {
      lottieRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    lottieRef.current?.seek(time);
  };

  const handleSpeedChange = (speed: number) => {
    lottieRef.current?.setSpeed(speed);
  };

  return (
    <div>
      <LottiePlayer
        ref={lottieRef}
        src="/animations/complex.json"
        autoplay={false}
        loop={false}
        onLoad={() => console.log('Ready to play')}
        onComplete={() => setIsPlaying(false)}
      />
      <div>
        <button onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button onClick={() => handleSeek(0)}>重置</button>
        <button onClick={() => handleSpeedChange(0.5)}>0.5x</button>
        <button onClick={() => handleSpeedChange(1)}>1x</button>
        <button onClick={() => handleSpeedChange(2)}>2x</button>
      </div>
    </div>
  );
}
```

### 事件处理

```tsx
function EventHandlingExample() {
  const handleLoad = () => {
    console.log('动画已加载');
  };

  const handleError = (error: any) => {
    console.error('动画加载失败:', error);
  };

  const handleComplete = () => {
    console.log('动画播放完成');
  };

  return (
    <LottiePlayer
      src="/animations/example.json"
      onLoad={handleLoad}
      onError={handleError}
      onComplete={handleComplete}
    />
  );
}
```

## 技术实现

- 基于 `@lottiefiles/dotlottie-wc` Web Component
- 使用 React `forwardRef` 和 `useImperativeHandle` 暴露控制方法
- 动态导入避免初始包体积增大
- TypeScript 类型安全
- 支持所有现代浏览器

## 注意事项

1. 确保 Lottie 动画文件路径正确且可访问
2. Web Component 会在首次使用时动态加载
3. 所有控制方法都是异步的，需要等待组件加载完成
4. 建议在生产环境中对动画文件进行优化

## 迁移指南

从 `lottie-web` 迁移到 `LottiePlayer`：

```tsx
// 旧的 lottie-web 方式
import lottie from 'lottie-web';

const animation = lottie.loadAnimation({
  container: containerRef.current,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/path/to/animation.json'
});

// 新的 LottiePlayer 方式
<LottiePlayer
  src="/path/to/animation.json"
  loop
  autoplay
/>
```

## 测试页面

访问 `/lottie-test` 查看组件的实际使用效果和示例代码。