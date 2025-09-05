// src/components/admin/AdminStatsGrid.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CurrencyDollarIcon,
  VideoCameraIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';

interface AdminStatsGridProps {
  stats: any;
}

const AdminStatsGrid: FC<AdminStatsGridProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.last24Hours.newUsers}`,
      changeType: 'increase' as const,
      icon: UsersIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Active Members',
      value: stats.activeMembers.toLocaleString(),
      change: `${((stats.activeMembers / stats.totalUsers) * 100).toFixed(1)}%`,
      changeType: 'neutral' as const,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      change: `+$${stats.last24Hours.revenue}`,
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Active Rooms',
      value: stats.totalRooms.toString(),
      change: `${stats.last24Hours.activeRooms} live`,
      changeType: 'neutral' as const,
      icon: VideoCameraIcon,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/20',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions.toLocaleString(),
      change: `+${stats.last24Hours.newTransactions}`,
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/20',
    },
    {
      title: 'Platform Balance',
      value: `$${stats.platformBalance}`,
      change: `${stats.monthlyGrowth}% growth`,
      changeType: 'increase' as const,
      icon: BanknotesIcon,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/20',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <p className="text-2xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'increase' 
                    ? 'text-green-400' 
                    : stat.changeType === 'decrease'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}>
                  {stat.changeType === 'increase' && '↗ '}
                  {stat.changeType === 'decrease' && '↘ '}
                  {stat.change}
                  <span className="text-slate-500 ml-1">24h</span>
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
  );
};

export default AdminStatsGrid;