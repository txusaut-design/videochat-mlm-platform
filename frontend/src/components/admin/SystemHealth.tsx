// src/components/admin/SystemHealth.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  SignalIcon,
  ServerIcon,
  CubeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';

interface SystemHealthProps {
  healthData: {
    apiResponse: 'excellent' | 'good' | 'fair' | 'poor';
    databaseStatus: 'excellent' | 'good' | 'fair' | 'poor';
    blockchainSync: 'excellent' | 'good' | 'fair' | 'poor';
    socketConnections: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

const SystemHealth: FC<SystemHealthProps> = ({ healthData }) => {
  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'good':
        return <CheckCircleIcon className="w-5 h-5 text-blue-400" />;
      case 'fair':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'poor':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-slate-400" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getHealthBg = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500/20';
      case 'good':
        return 'bg-blue-500/20';
      case 'fair':
        return 'bg-yellow-500/20';
      case 'poor':
        return 'bg-red-500/20';
      default:
        return 'bg-slate-500/20';
    }
  };

  const healthItems = [
    {
      name: 'API Response',
      status: healthData.apiResponse,
      icon: SignalIcon,
      description: 'API response time and availability'
    },
    {
      name: 'Database',
      status: healthData.databaseStatus,
      icon: ServerIcon,
      description: 'PostgreSQL connection and performance'
    },
    {
      name: 'Blockchain Sync',
      status: healthData.blockchainSync,
      icon: CubeIcon,
      description: 'Polygon network synchronization'
    },
    {
      name: 'WebSocket',
      status: healthData.socketConnections,
      icon: GlobeAltIcon,
      description: 'Real-time connections status'
    }
  ];

  const overallHealth = healthItems.reduce((acc, item) => {
    const score = {
      'excellent': 4,
      'good': 3,
      'fair': 2,
      'poor': 1
    }[item.status] || 0;
    return acc + score;
  }, 0);

  const averageHealth = overallHealth / healthItems.length;
  const overallStatus = 
    averageHealth >= 3.5 ? 'excellent' :
    averageHealth >= 2.5 ? 'good' :
    averageHealth >= 1.5 ? 'fair' : 'poor';

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">System Health</h2>
          <p className="text-sm text-slate-400">Real-time system monitoring</p>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getHealthBg(overallStatus)}`}>
          {getHealthIcon(overallStatus)}
          <span className={`text-sm font-medium ${getHealthColor(overallStatus)}`}>
            {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {healthItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-xs text-slate-500">{item.description}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {getHealthIcon(item.status)}
              <span className={`text-sm font-medium ${getHealthColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">99.9%</div>
            <div className="text-xs text-slate-400">Uptime</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">85ms</div>
            <div className="text-xs text-slate-400">Avg Response</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">1,247</div>
            <div className="text-xs text-slate-400">Active Sessions</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SystemHealth;
