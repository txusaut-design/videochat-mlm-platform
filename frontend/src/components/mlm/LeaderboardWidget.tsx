// src/components/mlm/LeaderboardWidget.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { 
  TrophyIcon,
  StarIcon,
  CrownIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import { formatUSDC } from '@/utils/web3Utils';

// Mock data - in real app this would come from API
const mockLeaderboard = [
  { rank: 1, username: 'CryptoKing', earnings: '1250.50', network: 45, growth: '+15%' },
  { rank: 2, username: 'NetworkPro', earnings: '890.25', network: 32, growth: '+12%' },
  { rank: 3, username: 'MLMaster', earnings: '675.80', network: 28, growth: '+8%' },
  { rank: 4, username: 'ReferralQueen', earnings: '543.20', network: 21, growth: '+5%' },
  { rank: 5, username: 'EarnMore', earnings: '432.10', network: 18, growth: '+3%' }
];

const LeaderboardWidget: FC = () => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownIcon className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <TrophyIcon className="w-5 h-5 text-gray-300" />;
      case 3:
        return <TrophyIcon className="w-5 h-5 text-amber-600" />;
      default:
        return <StarIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 bg-yellow-400/20';
      case 2:
        return 'text-gray-300 bg-gray-300/20';
      case 3:
        return 'text-amber-600 bg-amber-600/20';
      default:
        return 'text-slate-400 bg-slate-400/20';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FireIcon className="w-5 h-5 mr-2 text-orange-500" />
            Top Earners
          </h3>
          <p className="text-sm text-slate-400">This month's leaderboard</p>
        </div>
        
        <div className="text-xs text-slate-500">
          Updates daily
        </div>
      </div>

      <div className="space-y-3">
        {mockLeaderboard.map((user, index) => (
          <motion.div
            key={user.username}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              user.rank <= 3 
                ? 'bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-slate-600' 
                : 'bg-slate-700/30 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(user.rank)}`}>
                {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
              </div>
              
              <div>
                <div className="font-medium text-white flex items-center space-x-2">
                  <span>{user.username}</span>
                  {user.rank === 1 && <span className="text-xs bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded">👑 #1</span>}
                </div>
                <div className="text-xs text-slate-400">
                  {user.network} network size • {user.growth}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-white">
                {formatUSDC(user.earnings)}
              </div>
              <div className="text-xs text-slate-400">
                This month
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 text-center">
        <div className="text-sm text-slate-400">
          Your current rank: <span className="text-white font-medium">#12</span>
        </div>
      </div>
    </Card>
  );
};

export default LeaderboardWidget;