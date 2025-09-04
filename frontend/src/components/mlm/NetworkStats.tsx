// src/components/mlm/NetworkStats.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { MlmStats } from '@/lib/types';
import Card from '@/components/ui/Card';
import { formatUSDC } from '@/utils/web3Utils';

interface NetworkStatsProps {
  mlmStats: MlmStats;
}

const NetworkStats: FC<NetworkStatsProps> = ({ mlmStats }) => {
  const statCards = [
    {
      title: 'Total Network',
      value: mlmStats.totalReferrals.toString(),
      subtitle: 'referrals',
      icon: UserGroupIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Members',
      value: mlmStats.activeReferrals.toString(),
      subtitle: 'active',
      icon: StarIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Earnings',
      value: formatUSDC(mlmStats.totalCommissions),
      subtitle: 'all time',
      icon: CurrencyDollarIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'This Month',
      value: formatUSDC(mlmStats.thisMonthCommissions),
      subtitle: 'earnings',
      icon: TrendingUpIcon,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/20',
      change: '+23%',
      changeType: 'positive' as const
    }
  ];

  const levelStats = [
    { level: 1, count: mlmStats.levels.level1?.count || 0, commission: '3.50', color: 'bg-primary-500' },
    { level: 2, count: mlmStats.levels.level2?.count || 0, commission: '1.00', color: 'bg-secondary-500' },
    { level: 3, count: mlmStats.levels.level3?.count || 0, commission: '1.00', color: 'bg-accent-500' },
    { level: 4, count: mlmStats.levels.level4?.count || 0, commission: '1.00', color: 'bg-blue-500' },
    { level: 5, count: mlmStats.levels.level5?.count || 0, commission: '1.00', color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-500">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`flex items-center mt-2 text-sm ${
                    stat.changeType === 'positive' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
                
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Level Breakdown */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Level Breakdown</h3>
            <p className="text-sm text-slate-400">Members and commissions per level</p>
          </div>
          <ChartBarIcon className="w-6 h-6 text-slate-400" />
        </div>

        <div className="space-y-4">
          {levelStats.map((level, index) => {
            const totalEarnings = level.count * parseFloat(level.commission);
            
            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${level.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold">{level.level}</span>
                  </div>
                  
                  <div>
                    <div className="font-medium text-white">
                      Level {level.level}
                    </div>
                    <div className="text-sm text-slate-400">
                      {level.commission} USDC per member
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-white">
                    {level.count} members
                  </div>
                  <div className="text-sm text-green-400">
                    {formatUSDC(totalEarnings.toString())} potential
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-lg border border-primary-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Maximum Potential</h4>
              <p className="text-sm text-slate-300">If all levels are filled</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">
                {formatUSDC('7.50')}
              </div>
              <div className="text-sm text-slate-400">per member payment</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NetworkStats;
