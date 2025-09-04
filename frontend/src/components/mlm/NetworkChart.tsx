// src/components/mlm/NetworkChart.tsx
'use client';

import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { MlmStats } from '@/lib/types';
import Card from '@/components/ui/Card';

interface NetworkChartProps {
  mlmStats: MlmStats;
  timeframe?: '7d' | '30d' | '90d' | 'all';
}

const NetworkChart: FC<NetworkChartProps> = ({ 
  mlmStats, 
  timeframe = '30d' 
}) => {
  // Create mock data for visualization (in a real app, this would come from API)
  const chartData = useMemo(() => {
    const levels = [1, 2, 3, 4, 5];
    return levels.map(level => {
      const levelData = mlmStats.levels[`level${level}`];
      const count = levelData?.count || 0;
      const potential = count * (level === 1 ? 3.5 : 1.0);
      
      return {
        level,
        members: count,
        potential,
        active: Math.floor(count * 0.8), // Assume 80% are active
        maxWidth: Math.max(count * 20, 20) // For visual representation
      };
    });
  }, [mlmStats]);

  const totalPotential = chartData.reduce((sum, level) => sum + level.potential, 0);
  const totalMembers = chartData.reduce((sum, level) => sum + level.members, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Network Distribution
          </h3>
          <p className="text-sm text-slate-400">Members across all levels</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{totalMembers}</div>
          <div className="text-sm text-slate-400">Total Members</div>
        </div>
      </div>

      <div className="space-y-4">
        {chartData.map((level, index) => (
          <motion.div
            key={level.level}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            {/* Level Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  level.level === 1 ? 'bg-primary-500' :
                  level.level === 2 ? 'bg-secondary-500' :
                  level.level === 3 ? 'bg-accent-500' :
                  level.level === 4 ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}>
                  {level.level}
                </div>
                <span className="text-white font-medium">Level {level.level}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-slate-300">
                  {level.members} members
                </div>
                <div className="text-green-400">
                  {level.potential.toFixed(1)} USDC potential
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-slate-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((level.members / 10) * 100, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  className={`h-3 rounded-full ${
                    level.level === 1 ? 'bg-primary-500' :
                    level.level === 2 ? 'bg-secondary-500' :
                    level.level === 3 ? 'bg-accent-500' :
                    level.level === 4 ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}
                />
              </div>
              
              {/* Active indicator */}
              <div className="absolute top-0 left-0 h-3 bg-white/20 rounded-full"
                style={{ width: `${Math.min((level.active / 10) * 100, 100)}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs text-slate-500">
              <span>{level.active} active</span>
              <span>Max: 10 members</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-400">{totalMembers}</div>
            <div className="text-xs text-slate-400">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{totalPotential.toFixed(1)}</div>
            <div className="text-xs text-slate-400">USDC Potential</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {totalMembers > 0 ? ((totalPotential / totalMembers) * 100 / 10).toFixed(0) : '0'}%
            </div>
            <div className="text-xs text-slate-400">Fill Rate</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NetworkChart;