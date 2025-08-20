"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageIcon, ArrowRight } from "lucide-react";
import React from "react";

// 1. 定义工具列表的数据结构
// 未来添加新工具时，只需在此数组中添加一个新对象即可
const tools = [
  {
    name: "图像压缩",
    description: "快速减小 JPG、PNG、WEBP 图片的体积。",
    href: "/compress",
    icon: <ImageIcon className="w-8 h-8" />,
  },
  // {
  //   name: "下一个很酷的工具",
  //   description: "这个工具的简短描述。",
  //   href: "/next-cool-tool",
  //   icon: <AnotherIconComponent className="w-8 h-8" />,
  // },
];

// 2. 创建主页组件
export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      {/* 标题区域 */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          在线工具集
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400">
          为您的日常数字任务提供简单、高效的解决方案。
        </p>
      </div>

      {/* 工具网格 */}
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

      {/* 页脚 */}
      <footer className="mt-20 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Web Tools. All Rights Reserved.</p>
      </footer>
    </main>
  );
}