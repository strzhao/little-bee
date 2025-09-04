import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "@/components/providers/jotai-provider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Little Bee - 汉字学习应用",
  description: "专为儿童设计的汉字学习应用，通过游戏化方式学习汉字",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Little Bee",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Little Bee",
    title: {
      default: "Little Bee - 汉字学习应用",
      template: "%s - Little Bee",
    },
    description: "专为儿童设计的汉字学习应用，通过游戏化方式学习汉字",
  },
  twitter: {
    card: "summary",
    title: {
      default: "Little Bee - 汉字学习应用",
      template: "%s - Little Bee",
    },
    description: "专为儿童设计的汉字学习应用，通过游戏化方式学习汉字",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="application-name" content="Little Bee" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Little Bee" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />
        
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#000000" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JotaiProvider>
          {children}
        </JotaiProvider>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            console.log('🔍 Service Worker 注册检查:');
            console.log('- 浏览器支持:', 'serviceWorker' in navigator);
            console.log('- 当前域名:', location.hostname);
            console.log('- 是否为本地环境:', location.hostname.includes('localhost'));
            
            // 开发环境下禁用 Service Worker 注册
            if ('serviceWorker' in navigator && !location.hostname.includes('localhost')) {
              console.log('✅ 满足注册条件，开始注册 Service Worker...');
              window.addEventListener('load', async function() {
                try {
                  // 简化的 Service Worker 注册逻辑
                  const registration = await navigator.serviceWorker.register('/sw.js', {
                    updateViaCache: 'none'
                  });
                  
                  console.log('✅ Service Worker 注册成功:', registration);
                  console.log('作用域:', registration.scope);
                  
                  // 统一的状态监听函数
                   function handleWorkerStateChange(worker, workerType) {
                     worker.addEventListener('statechange', () => {
                       console.log('📊 ' + workerType + ' Service Worker 状态:', worker.state);
                       
                       switch (worker.state) {
                         case 'installing':
                           console.log('🔄 Service Worker 正在安装...');
                           break;
                         case 'installed':
                           console.log('✅ Service Worker 安装完成');
                           if (navigator.serviceWorker.controller) {
                             console.log('🔄 新版本等待激活，刷新页面生效');
                           } else {
                             console.log('🎉 Service Worker 首次安装成功');
                           }
                           break;
                         case 'activating':
                           console.log('🔄 Service Worker 正在激活...');
                           break;
                         case 'activated':
                           console.log('🚀 Service Worker 已激活并运行');
                           break;
                         case 'redundant':
                           console.log('⚠️ Service Worker 已被新版本替换');
                           break;
                       }
                     });
                   }
                  
                  // 监听更新事件
                  registration.addEventListener('updatefound', () => {
                    console.log('🆕 发现 Service Worker 更新');
                    const newWorker = registration.installing;
                    if (newWorker) {
                      handleWorkerStateChange(newWorker, '新版本');
                    }
                  });
                  
                  // 检查当前状态
                  if (registration.installing) {
                    console.log('🔄 Service Worker 正在安装中...');
                    handleWorkerStateChange(registration.installing, '安装中');
                  } else if (registration.waiting) {
                    console.log('⏳ Service Worker 等待激活');
                    handleWorkerStateChange(registration.waiting, '等待中');
                  } else if (registration.active) {
                    console.log('✅ Service Worker 已激活');
                    handleWorkerStateChange(registration.active, '当前');
                  }
                  
                  // 监听 Service Worker 控制器变化
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔄 Service Worker 控制器已更新');
                  });
                  
                } catch (error) {
                  console.error('❌ Service Worker 操作失败:', error);
                }
              });
            } else {
              if (!('serviceWorker' in navigator)) {
                console.warn('⚠️ 浏览器不支持 Service Worker');
              } else if (location.hostname.includes('localhost')) {
                console.log('🚫 开发环境，跳过 Service Worker 注册');
              } else {
                console.warn('⚠️ 未知原因，Service Worker 注册被跳过');
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
}
