// src/components/mlm/NetworkInsights.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  UserPlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { MlmStats } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface NetworkInsightsProps {
  mlmStats: MlmStats;
}

const NetworkInsights: FC<NetworkInsightsProps> = ({ mlmStats }) => {
  // Generate insights based on network data
  const insights = [
    {
      type: 'opportunity',
      icon: ArrowTrendingUpIcon,
      title: 'Growth Opportunity',
      message: `Your Level 1 has ${mlmStats.levels.level1?.count || 0} members. Adding 2 more could increase monthly earnings by $7.`,
      action: 'Share referral link',
      priority: 'high'
    },
    {
      type: 'tip',
      icon: LightBulbIcon,
      title: 'Network Building Tip',
      message: 'Focus on helping your direct referrals succeed. Their success creates deeper levels for you.',
      priority: 'medium'
    },
    {
      type: 'achievement',
      icon: CheckCircleIcon,
      title: 'Milestone Reached',
      message: `Congratulations! You've reached ${mlmStats.totalReferrals} total referrals in your network.`,
      priority: 'low'
    },
    {
      type: 'warning',
      icon: ExclamationCircleIcon,
      title: 'Inactive Members',
      message: `${mlmStats.totalReferrals - mlmStats.activeReferrals} members are inactive. Consider reaching out to re-engage them.`,
      action: 'View inactive list',
      priority: 'medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'border-green-500/30 bg-green-500/10';
      default:
        return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-400';
      case 'tip':
        return 'text-blue-400';
      case 'achievement':
        return 'text-purple-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <LightBulbIcon className="w-5 h-5 mr-2" />
            Network Insights
          </h3>
          <p className="text-sm text-slate-400">Personalized recommendations for your network</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
          >
            <div className="flex items-start space-x-3">
              <insight.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getIconColor(insight.type)}`} />
              
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{insight.title}</h4>
                <p className="text-sm text-slate-300 mb-3">{insight.message}</p>
                
                {insight.action && (
                  <Button variant="ghost" size="small">
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary-400">
              {mlmStats.activeReferrals > 0 
                ? ((mlmStats.activeReferrals / mlmStats.totalReferrals) * 100).toFixed(0)
                : '0'
              }%
            </div>
            <div className="text-xs text-slate-400">Activity Rate</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-green-400">
              {parseFloat(mlmStats.thisMonthCommissions) > 0 ? '+' : ''}
              {((parseFloat(mlmStats.thisMonthCommissions) / Math.max(parseFloat(mlmStats.totalCommissions), 1)) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-400">Monthly Growth</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-blue-400">
              {mlmStats.totalReferrals > 0 
                ? (parseFloat(mlmStats.totalCommissions) / mlmStats.totalReferrals).toFixed(1)
                : '0'
              }
            </div>
            <div className="text-xs text-slate-400">USDC per Member</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NetworkInsights;
