'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useResourcePreloader, usePreloadStats, useBackgroundPreloader } from '@/hooks/use-resource-preloader';
import { useAtomValue } from 'jotai';
import { allHanziDataAtom } from '@/lib/atoms/hanzi-atoms';
import { useRouter } from 'next/navigation';

export default function TestPreloadPage() {
  const router = useRouter();
  const allHanzi = useAtomValue(allHanziDataAtom);
  const { preloadCharacter, preloadMultiple, isPreloading } = useResourcePreloader();
  const stats = usePreloadStats();
  const backgroundPreloader = useBackgroundPreloader();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 测试单个汉字预加载
  const testSinglePreload = async () => {
    if (!allHanzi || allHanzi.length === 0) {
      addResult('❌ 没有可用的汉字数据');
      return;
    }

    const testHanzi = allHanzi[0];
    addResult(`🔄 开始预加载单个汉字: ${testHanzi.character}`);
    
    try {
      await preloadCharacter(testHanzi);
      addResult(`✅ 成功预加载汉字: ${testHanzi.character}`);
    } catch (error) {
      addResult(`❌ 预加载失败: ${error}`);
    }
  };

  // 测试批量预加载
  const testBatchPreload = async () => {
    if (!allHanzi || allHanzi.length === 0) {
      addResult('❌ 没有可用的汉字数据');
      return;
    }

    const testHanzi = allHanzi.slice(0, 5);
    addResult(`🔄 开始批量预加载 ${testHanzi.length} 个汉字`);
    
    try {
      await preloadMultiple(testHanzi);
      addResult(`✅ 成功批量预加载 ${testHanzi.length} 个汉字`);
    } catch (error) {
      addResult(`❌ 批量预加载失败: ${error}`);
    }
  };

  // 测试后台预加载
  const testBackgroundPreload = async () => {
    addResult('🔄 开始后台预加载所有资源');
    
    try {
      await backgroundPreloader.start();
      addResult('✅ 后台预加载已启动');
    } catch (error) {
      addResult(`❌ 后台预加载启动失败: ${error}`);
    }
  };

  // 清除测试结果
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
            >
              ← 返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">资源预加载测试</h1>
          </div>
        </div>

        {/* 统计信息 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📊 预加载统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allHanzi?.length || 0}</div>
              <div className="text-gray-600">总汉字数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.loaded}</div>
              <div className="text-gray-600">已预加载</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.failed}</div>
              <div className="text-gray-600">加载失败</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {allHanzi?.length ? Math.round((stats.loaded / (allHanzi.length * 4)) * 100) : 0}%
              </div>
              <div className="text-gray-600">完成率</div>
            </div>
          </div>
          
          {allHanzi?.length && (
            <div className="mt-4">
              <Progress 
                value={allHanzi.length ? (stats.loaded / (allHanzi.length * 4)) * 100 : 0} 
                className="h-2"
              />
            </div>
          )}
        </Card>

        {/* 测试按钮 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🧪 测试功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={testSinglePreload}
              disabled={isPreloading || !allHanzi || allHanzi.length === 0}
              className="h-12"
            >
              {isPreloading ? '预加载中...' : '测试单个预加载'}
            </Button>
            
            <Button
              onClick={testBatchPreload}
              disabled={isPreloading || !allHanzi || allHanzi.length === 0}
              variant="outline"
              className="h-12"
            >
              {isPreloading ? '预加载中...' : '测试批量预加载'}
            </Button>
            
            <Button
              onClick={testBackgroundPreload}
              disabled={backgroundPreloader.isActive}
              variant="secondary"
              className="h-12"
            >
              {backgroundPreloader.isActive ? `后台预加载中 ${Math.round(backgroundPreloader.progress)}%` : '测试后台预加载'}
            </Button>
          </div>
        </Card>

        {/* 测试结果 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📝 测试结果</h3>
            <Button onClick={clearResults} variant="outline" size="sm">
              清除结果
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无测试结果</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 汉字数据状态 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📚 汉字数据状态</h3>
          <div className="text-sm space-y-2">
            <div>总汉字数量: <span className="font-semibold">{allHanzi?.length || 0}</span></div>
            <div>数据加载状态: <span className="font-semibold">{allHanzi ? '✅ 已加载' : '⏳ 加载中'}</span></div>
            {allHanzi && allHanzi.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">示例汉字:</p>
                <div className="flex flex-wrap gap-2">
                  {allHanzi.slice(0, 10).map(hanzi => (
                    <span key={hanzi.id} className="px-2 py-1 bg-blue-100 rounded text-sm">
                      {hanzi.character}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}