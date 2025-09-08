import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "@/components/providers/jotai-provider";
import { BackgroundPreloaderProvider } from "@/components/providers/background-preloader";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { AppHeader } from "@/components/layout/AppHeader";
import { ControlCenter } from "@/components/features/control-center/ControlCenter";

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
          <BackgroundPreloaderProvider>
            <AppHeader />
            <main>
              {children}
            </main>
            <ControlCenter />
          </BackgroundPreloaderProvider>
        </JotaiProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}