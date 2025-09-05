// src/components/mlm/CommissionHistory.tsx
'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { MlmCommission } from '@/lib/types';
import { formatUSDC, getExplorerUrl, formatTransactionHash } from '@/utils/web3Utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface CommissionHistoryProps {
  commissions: MlmCommission[];
  totalCommissions: string;
  monthlyCommissions: string;
}

const CommissionHistory: FC<CommissionHistoryProps> = ({
  commissions,
  totalCommissions,
  monthlyCommissions
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  const filteredCommissions = commissions.filter(commission => {
    const statusMatch = filterStatus === 'all' || commission.status === filterStatus;
    const levelMatch = filterLevel === 'all' || commission.level === filterLevel;
    return statusMatch && levelMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-primary-500/20 text-primary-300',
      'bg-secondary-500/20 text-secondary-300',
      'bg-accent-500/20 text-accent-300',
      'bg-blue-500/20 text-blue-300',
      'bg-purple-500/20 text-purple-300'
    ];
    return colors[level - 1] || 'bg-slate-500/20 text-slate-300';
  };

  // Calculate statistics
  const paidCommissions = commissions.filter(c => c.status === 'paid');
  const pendingCommissions = commissions.filter(c => c.status === 'pending');
  const thisMonthPaid = paidCommissions.filter(c => {
    if (!c.paid_at) return false;
    const paidDate = new Date(c.paid_at);
    const now = new Date();
    return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
  });

  const lastMonthPaid = paidCommissions.filter(c => {
    if (!c.paid_at) return false;
    const paidDate = new Date(c.paid_at);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return paidDate.getMonth() === lastMonth.getMonth() && paidDate.getFullYear() === lastMonth.getFullYear();
  });

  const monthlyGrowth = lastMonthPaid.length > 0 
    ? ((thisMonthPaid.length - lastMonthPaid.length) / lastMonthPaid.length) * 100
    : thisMonthPaid.length > 0 ? 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-white">
                {formatUSDC(totalCommissions)}
              </p>
              <p className="text-sm text-green-400">All time</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">This Month</p>
              <p className="text-2xl font-bold text-white">
                {formatUSDC(monthlyCommissions)}
              </p>
              <div className={`flex items-center text-sm ${
                monthlyGrowth >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {monthlyGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                {Math.abs(monthlyGrowth).toFixed(1)}%
              </div>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">
                {pendingCommissions.length}
              </p>
              <p className="text-sm text-yellow-400">Commissions</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {commissions.length > 0 
                  ? ((paidCommissions.length / commissions.length) * 100).toFixed(1)
                  : '0'
                }%
              </p>
              <p className="text-sm text-primary-400">Paid out</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-primary-500" />
          </div>
        </Card>
      </div>

      {/* Commission History */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Commission History</h2>
            <p className="text-sm text-slate-400 mt-1">
              Track your earnings from referral network
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Levels</option>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Commissions Yet</h3>
              <p className="text-slate-400">
                Start sharing your referral link to earn your first commission!
              </p>
            </div>
          ) : (
            filteredCommissions.map((commission, index) => (
              <motion.div
                key={commission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(commission.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(commission.level)}`}>
                      L{commission.level}
                    </span>
                  </div>

                  <div>
                    <div className="font-medium text-white">
                      From {commission.payer_username}
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(commission.created_at).toLocaleDateString()} • 
                      Level {commission.level} commission
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatUSDC(commission.amount)}
                    </div>
                    <div className={`text-sm capitalize ${getStatusColor(commission.status)}`}>
                      {commission.status}
                    </div>
                  </div>

                  {commission.transaction_hash && (
                    <button
                      onClick={() => window.open(getExplorerUrl(commission.transaction_hash!), '_blank')}
                      className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                      title="View transaction"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination could be added here if needed */}
        {filteredCommissions.length > 10 && (
          <div className="mt-6 flex justify-center">
            <Button variant="ghost" size="small">
              Load More
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CommissionHistory;