// src/components/admin/RevenueChart.tsx
'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';

const RevenueChart: FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock revenue data
  const revenueData = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [1250, 1480, 1320, 1650, 1890, 2100, 1750],
      total: 11440,
      growth: 15.2
    },
    '30d': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [8500, 9200, 8800, 10200],
      total: 36700,
      growth: 8.7
    },
    '90d': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      data: [28500, 32200, 36700],
      total: 97400,
      growth: 12.4
    }
  };

  const currentData = revenueData[timeframe];
  const maxRevenue = Math.max(...currentData.data);

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Revenue Overview</h2>
          <p className="text-sm text-slate-400">Platform revenue and growth</p>
        </div>
        
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map(period => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-green-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${currentData.total.toLocaleString()}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-400">Growth Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">
            +{currentData.growth}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {currentData.labels.map((label, index) => {
          const value = currentData.data[index];
          const percentage = (value / maxRevenue) * 100;
          
          return (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-medium">${value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Average: ${Math.round(currentData.total / currentData.data.length).toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-green-400">
          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          +{currentData.growth}% vs previous period
        </div>
      </div>
    </Card>
  );
};

export default RevenueChart;