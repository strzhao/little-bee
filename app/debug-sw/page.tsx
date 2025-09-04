'use client';

import { useEffect, useState } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export default function ServiceWorkerDebug() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [registrations, setRegistrations] = useState<ServiceWorkerRegistration[]>([]);
  const [swState, setSwState] = useState<string>('unknown');
  const [controllerState, setControllerState] = useState<string>('none');

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`${timestamp}: ${message}`);
  };

  const checkServiceWorkerSupport = () => {
    const supported = 'serviceWorker' in navigator;
    setIsSupported(supported);
    if (supported) {
      addLog('✅ 浏览器支持 Service Worker', 'success');
    } else {
      addLog('❌ 浏览器不支持 Service Worker', 'error');
    }
    return supported;
  };

  const getExistingRegistrations = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      setRegistrations([...regs]);
      addLog(`现有注册数量: ${regs.length}`);
      
      if (regs.length === 0) {
        addLog('❌ 没有找到任何 Service Worker 注册', 'error');
      } else {
        regs.forEach((reg, index) => {
          addLog(`注册 ${index + 1}: 范围 ${reg.scope}`);
          if (reg.active) {
            addLog(`  - 活跃状态: ${reg.active.state}`, 'success');
            setSwState(reg.active.state);
          }
          if (reg.waiting) {
            addLog(`  - 等待状态: ${reg.waiting.state}`, 'warning');
          }
          if (reg.installing) {
            addLog(`  - 安装状态: ${reg.installing.state}`, 'info');
          }
        });
      }
    } catch (error) {
      addLog(`获取注册信息失败: ${error}`, 'error');
    }
  };

  const checkController = () => {
    if (navigator.serviceWorker.controller) {
      const state = navigator.serviceWorker.controller.state;
      setControllerState(state);
      addLog(`✅ 活跃的 Service Worker 控制器: ${state}`, 'success');
      addLog(`控制器脚本 URL: ${navigator.serviceWorker.controller.scriptURL}`);
    } else {
      setControllerState('none');
      addLog('❌ 没有活跃的 Service Worker 控制器', 'error');
    }
  };

  const registerServiceWorker = async () => {
    try {
      addLog('尝试注册 Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      addLog(`✅ 注册成功: ${registration.scope}`, 'success');
      
      // 立即检查状态
      if (registration.active) {
        addLog(`当前活跃 SW 状态: ${registration.active.state}`);
        setSwState(registration.active.state);
      }
      
      // 监听状态变化
      const monitorWorker = (worker: ServiceWorker, label: string) => {
        addLog(`${label} SW 初始状态: ${worker.state}`);
        worker.addEventListener('statechange', () => {
          const newState = worker.state;
          addLog(`${label} 状态变化: ${newState}`, 
            newState === 'redundant' ? 'error' : 
            newState === 'activated' ? 'success' : 'info'
          );
          setSwState(newState);
          
          if (newState === 'redundant') {
            addLog('⚠️ Service Worker 变为 redundant 状态！这通常表示有错误或冲突', 'error');
          } else if (newState === 'activated') {
            addLog('🎉 Service Worker 成功激活！', 'success');
            // 重新检查控制器
            setTimeout(checkController, 100);
          }
        });
      };
      
      if (registration.installing) {
        addLog('Service Worker 正在安装...');
        monitorWorker(registration.installing, '安装中');
      }
      
      if (registration.waiting) {
        addLog('Service Worker 正在等待...');
        monitorWorker(registration.waiting, '等待中');
      }
      
      if (registration.active) {
        addLog('Service Worker 已激活');
        monitorWorker(registration.active, '已激活');
      }
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        addLog('发现 Service Worker 更新');
        if (registration.installing) {
          monitorWorker(registration.installing, '更新安装');
        }
      });
      
      // 等待一段时间后重新检查状态
      setTimeout(async () => {
        await getExistingRegistrations();
        checkController();
      }, 2000);
      
    } catch (error) {
      addLog(`❌ 注册失败: ${error}`, 'error');
    }
  };

  const testCaching = async () => {
    addLog('测试缓存功能...');
    try {
      // 测试获取一个资源
      const response = await fetch('/manifest.json');
      if (response.ok) {
        addLog('✅ 资源获取成功，缓存应该正在工作', 'success');
      } else {
        addLog('❌ 资源获取失败', 'error');
      }
    } catch (error) {
      addLog(`缓存测试失败: ${error}`, 'error');
    }
  };

  const runDiagnostics = async () => {
    addLog('🔍 开始 Service Worker 全面诊断', 'info');
    
    // 检查支持
    if (!checkServiceWorkerSupport()) {
      return;
    }
    
    // 检查域名和环境
    addLog(`当前域名: ${window.location.hostname}`);
    addLog(`是否为本地环境: ${window.location.hostname === 'localhost'}`);
    addLog(`当前协议: ${window.location.protocol}`);
    
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      addLog('⚠️ Service Worker 需要 HTTPS 或 localhost 环境', 'warning');
    }
    
    // 获取现有注册
    await getExistingRegistrations();
    
    // 检查控制器
    checkController();
    
    // 尝试注册
    await registerServiceWorker();
    
    // 测试缓存
    setTimeout(testCaching, 3000);
  };

  useEffect(() => {
    runDiagnostics();
    
    // 监听 Service Worker 控制器变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      addLog('🔄 Service Worker 控制器发生变化', 'info');
      checkController();
    });
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const unregisterAll = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
        addLog(`已注销: ${reg.scope}`, 'warning');
      }
      addLog('✅ 所有 Service Worker 已注销', 'success');
      setRegistrations([]);
      setSwState('unknown');
      setControllerState('none');
    } catch (error) {
      addLog(`注销失败: ${error}`, 'error');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Service Worker 深度诊断工具</h1>
      
      <div className="mb-6 space-x-4">
        <button 
          onClick={runDiagnostics}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          🔍 重新诊断
        </button>
        <button 
          onClick={clearLogs}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          🗑️ 清空日志
        </button>
        <button 
          onClick={unregisterAll}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          ❌ 注销所有 SW
        </button>
        <button 
          onClick={testCaching}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          🧪 测试缓存
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">浏览器支持</h3>
          <p className={isSupported ? 'text-green-600' : 'text-red-600'}>
            {isSupported ? '✅ 支持' : '❌ 不支持'}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">SW 状态</h3>
          <p className={`font-mono ${
            swState === 'activated' ? 'text-green-600' :
            swState === 'redundant' ? 'text-red-600' :
            swState === 'installing' ? 'text-blue-600' :
            'text-gray-600'
          }`}>
            {swState}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">控制器状态</h3>
          <p className={`font-mono ${
            controllerState === 'activated' ? 'text-green-600' :
            controllerState === 'none' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {controllerState}
          </p>
        </div>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500">等待诊断结果...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`mb-1 ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-green-400' : 
              log.type === 'warning' ? 'text-yellow-400' :
              'text-white'
            }`}>
              <span className="text-gray-400">{log.timestamp}:</span> {log.message}
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">注册详情</h2>
        {registrations.length === 0 ? (
          <p className="text-gray-500">没有找到 Service Worker 注册</p>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold">注册 {index + 1}</h3>
                <p><strong>范围:</strong> {reg.scope}</p>
                {reg.active && <p><strong>活跃状态:</strong> {reg.active.state}</p>}
                {reg.waiting && <p><strong>等待状态:</strong> {reg.waiting.state}</p>}
                {reg.installing && <p><strong>安装状态:</strong> {reg.installing.state}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}