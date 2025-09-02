'use client';

import React from 'react';
import Link from 'next/link';
import { AgeGate } from '@/components/features/age-gate/AgeGate';
import { useAgeGroup } from '@/lib/hooks/use-age-group';
import { AGE_GROUPS } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageIcon, ArrowRight, BookOpen } from "lucide-react";

import { ToddlerGamePage } from '@/components/features/hanzi-game-toddler/ToddlerGamePage';

// Placeholder for the Child Game Page
function ChildGamePage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-blue-100">
      <h1 className="text-3xl font-bold">探索版 (5-7岁) 游戏即将上线</h1>
    </div>
  );
}

// The original HomePage content, now repurposed as the "Student" version.
function StudentHomePage() {
    const tools = [
        {
          name: "识字小蜜蜂🐝",
          description: "趣味汉字学习，从甲骨文到现代字体的演变历程。",
          href: "/hanzi",
          icon: <BookOpen className="w-8 h-8" />,
        },
        {
          name: "图像压缩",
          description: "快速减小 JPG、PNG、WEBP 图片的体积。",
          href: "/compress",
          icon: <ImageIcon className="w-8 h-8" />,
        },
      ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-0 left-0 w-full p-4 sm:p-6 md:p-8">
        <div className="font-mono text-sm font-semibold text-gray-600 dark:text-gray-300">
          string & keke 专用
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            一个工具集
          </h1>
        </div>

        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {tools.map((tool) => (
              <Link href={tool.href} key={tool.name} passHref>
                <Card className="group w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700/50 hover:border-blue-500 dark:hover:border-blue-500">
                  <div>
                    <div className="mb-4 text-blue-600 dark:text-blue-400">
                      {tool.icon}
                    </div>
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {tool.name}
                      </CardTitle>
                    </CardHeader>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </CardDescription>
                  </div>
                  <div className="mt-6 flex justify-end items-center text-sm font-medium text-gray-500 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    立即使用 <ArrowRight className="ml-1.5 w-4 h-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <footer className="mt-20 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Web Tools. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}

function AgeSpecificContent() {
  const { ageGroup } = useAgeGroup();

  switch (ageGroup) {
    case AGE_GROUPS.TODDLER:
      return <ToddlerGamePage />;
    case AGE_GROUPS.CHILD:
      return <ChildGamePage />;
    case AGE_GROUPS.STUDENT:
      return <StudentHomePage />;
    default:
      // This case should ideally not be reached if AgeGate is working correctly,
      // but it's good practice to have a fallback.
      return null;
  }
}

export default function HomePage() {
  return (
    <AgeGate>
      <AgeSpecificContent />
    </AgeGate>
  );
}