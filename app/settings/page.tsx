'use client';

import { PWACacheManager } from '@/components/features/pwa-cache-manager';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              ← 返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">应用设置</h1>
          </div>
        </div>

        {/* PWA 缓存管理 */}
        <PWACacheManager />

        {/* 其他设置选项 */}
        <div className="grid gap-4">
          {/* 应用信息 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📱 应用信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">应用名称</span>
                <span className="font-medium">Little Bee - 汉字学习</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">版本</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PWA 支持</span>
                <span className="text-green-600 font-medium">✅ 已启用</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">离线功能</span>
                <span className="text-green-600 font-medium">✅ 已启用</span>
              </div>
            </div>
          </div>

          {/* 学习数据 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📚 学习数据
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">汉字分类</span>
                <span className="font-medium">5 个分类</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总汉字数</span>
                <span className="font-medium">20+ 个汉字</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">字体支持</span>
                <span className="font-medium">甲骨文、金文、楷书、小篆</span>
              </div>
            </div>
          </div>

          {/* 功能特性 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ⚡ 功能特性
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>离线访问</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>智能缓存</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>响应式设计</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>桌面安装</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>语音朗读</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>动画效果</span>
              </div>
            </div>
          </div>

          {/* 帮助信息 */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
              💡 使用提示
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• <strong>离线使用：</strong>首次访问后，应用可在无网络环境下正常使用</p>
              <p>• <strong>桌面安装：</strong>在浏览器中点击"添加到主屏幕"可安装到桌面</p>
              <p>• <strong>缓存管理：</strong>定期清理缓存可释放存储空间</p>
              <p>• <strong>最佳体验：</strong>建议在WiFi环境下首次加载所有内容</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}