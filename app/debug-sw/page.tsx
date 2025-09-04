'use client';

import { useEffect, useState } from 'react';

export default function DebugServiceWorker() {
  const [logs, setLogs] = useState<string[]>([]);
  const [swStatus, setSWStatus] = useState<string>('检查中...');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const checkServiceWorker = async () => {
      addLog('开始 Service Worker 诊断');
      
      // 检查浏览器支持
      if (!('serviceWorker' in navigator)) {
        addLog('❌ 浏览器不支持 Service Worker');
        setSWStatus('不支持');
        return;
      }
      addLog('✅ 浏览器支持 Service Worker');
      
      // 检查当前域名
      addLog(`当前域名: ${window.location.hostname}`);
      addLog(`是否为本地环境: ${window.location.hostname.includes('localhost')}`);
      
      // 检查现有注册
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        addLog(`现有注册数量: ${registrations.length}`);
        
        if (registrations.length > 0) {
          registrations.forEach((reg, index) => {
            addLog(`注册 ${index + 1}: scope=${reg.scope}`);
            if (reg.active) {
              addLog(`  - 活跃状态: ${reg.active.state}`);
              addLog(`  - 脚本URL: ${reg.active.scriptURL}`);
            }
            if (reg.waiting) {
              addLog(`  - 等待状态: ${reg.waiting.state}`);
            }
            if (reg.installing) {
              addLog(`  - 安装状态: ${reg.installing.state}`);
            }
          });
        } else {
          addLog('❌ 没有找到任何 Service Worker 注册');
        }
      } catch (error) {
        addLog(`❌ 获取注册信息失败: ${error}`);
      }
      
      // 检查控制器
      if (navigator.serviceWorker.controller) {
        addLog(`✅ 当前控制器: ${navigator.serviceWorker.controller.scriptURL}`);
        addLog(`控制器状态: ${navigator.serviceWorker.controller.state}`);
        setSWStatus('已激活');
      } else {
        addLog('❌ 没有活跃的 Service Worker 控制器');
        setSWStatus('未激活');
      }
      
      // 尝试注册
      if (!window.location.hostname.includes('localhost')) {
        addLog('尝试注册 Service Worker...');
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          addLog(`✅ 注册成功: ${registration.scope}`);
          
          // 监听状态变化
          if (registration.installing) {
            addLog('Service Worker 正在安装...');
            registration.installing.addEventListener('statechange', (e) => {
              const target = e.target as ServiceWorker;
              addLog(`安装状态变化: ${target.state}`);
            });
          }
          
          if (registration.waiting) {
            addLog('Service Worker 等待激活');
          }
          
          if (registration.active) {
            addLog(`Service Worker 已激活: ${registration.active.state}`);
            setSWStatus('已激活');
          }
          
        } catch (error) {
          addLog(`❌ 注册失败: ${error}`);
          setSWStatus('注册失败');
        }
      } else {
        addLog('🚫 本地环境，跳过注册');
        setSWStatus('本地环境');
      }
    };
    
    checkServiceWorker();
    
    // 监听 Service Worker 事件
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      addLog('🔄 Service Worker 控制器已更新');
      setSWStatus('已更新');
    });
    
    navigator.serviceWorker.addEventListener('message', (event) => {
      addLog(`📨 收到 Service Worker 消息: ${JSON.stringify(event.data)}`);
    });
    
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Service Worker 诊断工具</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">当前状态</h2>
        <p>Service Worker 状态: <span className="font-mono">{swStatus}</span></p>
        <p>页面URL: <span className="font-mono">{typeof window !== 'undefined' ? window.location.href : ''}</span></p>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={clearLogs}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          清空日志
        </button>
        <button 
          onClick={refreshPage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          刷新页面
        </button>
      </div>
      
      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        <h3 className="text-white mb-2">诊断日志:</h3>
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500">等待诊断结果...</div>
        )}
      </div>
    </div>
  );
}