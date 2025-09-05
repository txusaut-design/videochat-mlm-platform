// src/components/admin/UserActivity.tsx
'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';

const UserActivity: FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Mock activity data
  const activityData = {
    '24h': [
      { time: '00:00', users: 45, transactions: 12, rooms: 3 },
      { time: '04:00', users: 32, transactions: 8, rooms: 2 },
      { time: '08:00', users: 89, transactions: 23, rooms: 7 },
      { time: '12:00', users: 156, transactions: 45, rooms: 12 },
      { time: '16:00', users: 198, transactions: 67, rooms: 15 },
      { time: '20:00', users: 167, transactions: 52, rooms: 11 },
    ],
    '7d': [
      { time: 'Mon', users: 1200, transactions: 340, rooms: 45 },
      { time: 'Tue', users: 1450, transactions: 389, rooms: 52 },
      { time: 'Wed', users: 1320, transactions: 367, rooms: 48 },
      { time: 'Thu', users: 1580, transactions: 423, rooms: 58 },
      { time: 'Fri', users: 1890, transactions: 512, rooms: 67 },
      { time: 'Sat', users: 2100, transactions: 578, rooms: 72 },
      { time: 'Sun', users: 1750, transactions: 465, rooms: 61 },
    ],
    '30d': [
      { time: 'Week 1', users: 8500, transactions: 2300, rooms: 320 },
      { time: 'Week 2', users: 9200, transactions: 2650, rooms: 365 },
      { time: 'Week 3', users: 8800, transactions: 2480, rooms: 342 },
      { time: 'Week 4', users: 10200, transactions: 2890, rooms: 398 },
    ]
  };

  const data = activityData[timeframe];
  const maxUsers = Math.max(...data.map(d => d.users));

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">User Activity</h2>
          <p className="text-sm text-slate-400">Active users and platform usage</p>
        </div>
        
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {(['24h', '7d', '30d'] as const).map(period => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-48 space-x-2">
          {data.map((point, index) => {
            const height = (point.users / maxUsers) * 100;
            return (
              <div key={point.time} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm min-h-[4px] relative group"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {point.users} users
                  </div>
                </motion.div>
                <div className="text-xs text-slate-400 mt-2">{point.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700">
        <div className="text-center">
          <UsersIcon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">
            {data.reduce((sum, d) => sum + d.users, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Total Users</div>
        </div>
        
        <div className="text-center">
          <CurrencyDollarIcon className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">
            {data.reduce((sum, d) => sum + d.transactions, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Transactions</div>
        </div>
        
        <div className="text-center">
          <VideoCameraIcon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">
            {data.reduce((sum, d) => sum + d.rooms, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Room Sessions</div>
        </div>
      </div>
    </Card>
  );
};

export default UserActivity;