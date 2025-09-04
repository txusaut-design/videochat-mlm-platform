// src/components/mlm/ReferralProgress.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { 
  TargetIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  type: 'referrals' | 'earnings' | 'levels';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ReferralProgressProps {
  totalReferrals: number;
  totalEarnings: string;
  activeLevels: number;
}

const ReferralProgress: FC<ReferralProgressProps> = ({
  totalReferrals,
  totalEarnings,
  activeLevels
}) => {
  const goals: Goal[] = [
    {
      id: '1',
      title: 'First Network',
      description: 'Reach 5 total referrals',
      target: 5,
      current: totalReferrals,
      reward: 'Achievement Badge',
      type: 'referrals',
      difficulty: 'easy'
    },
    {
      id: '2',
      title: 'Century Club',
      description: 'Earn 100 USDC in commissions',
      target: 100,
      current: parseFloat(totalEarnings),
      reward: 'Special Recognition',
      type: 'earnings',
      difficulty: 'medium'
    },
    {
      id: '3',
      title: 'Full Network',
      description: 'Activate all 5 levels',
      target: 5,
      current: activeLevels,
      reward: 'Elite Status',
      type: 'levels',
      difficulty: 'hard'
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'hard':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'referrals':
        return TargetIcon;
      case 'earnings':
        return TrophyIcon;
      case 'levels':
        return StarIcon;
      default:
        return TargetIcon;
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TargetIcon className="w-5 h-5 mr-2" />
            Progress Goals
          </h3>
          <p className="text-sm text-slate-400">Track your achievements</p>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progress = getProgressPercentage(goal.current, goal.target);
          const isCompleted = progress >= 100;
          const Icon = getTypeIcon(goal.type);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-colors ${
                isCompleted 
                  ? 'border-green-500/30 bg-green-500/10' 
                  : 'border-slate-600 bg-slate-700/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white">{goal.title}</h4>
                    <p className="text-sm text-slate-400">{goal.description}</p>
                  </div>
                </div>

                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(goal.difficulty)}`}>
                  {goal.difficulty}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>{goal.current} / {goal.target}</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className={`h-2 rounded-full ${
                      isCompleted ? 'bg-green-500' : 'bg-primary-500'
                    }`}
                  />
                </div>
              </div>

              {/* Reward */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Reward:</span>
                <span className={isCompleted ? 'text-green-400' : 'text-slate-300'}>
                  {goal.reward} {isCompleted && '✓'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default ReferralProgress;