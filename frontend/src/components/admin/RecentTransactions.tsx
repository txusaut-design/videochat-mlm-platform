// src/components/admin/RecentTransactions.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import { formatUSDC, getExplorerUrl, formatTransactionHash } from '@/utils/web3Utils';

// Mock data - in real app this would come from API
const mockTransactions = [
  {
    id: '1',
    username: 'john.doe',
    type: 'membership',
    amount: '10.00',
    status: 'confirmed',
    txHash: '0x1234...5678',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    username: 'alice.smith',
    type: 'commission',
    amount: '3.50',
    status: 'pending',
    txHash: '0x2345...6789',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    username: 'bob.wilson',
    type: 'membership',
    amount: '10.00',
    status: 'confirmed',
    txHash: '0x3456...7890',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: '4',
    username: 'carol.jones',
    type: 'commission',
    amount: '1.00',
    status: 'failed',
    txHash: '0x4567...8901',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const RecentTransactions: FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
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
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
          <p className="text-sm text-slate-400">Latest platform transactions</p>
        </div>
        <button className="text-sm text-blue-400 hover:text-blue-300">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {mockTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(transaction.status)}
                <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
              </div>

              <div>
                <div className="font-medium text-white">
                  {transaction.username}
                </div>
                <div className="text-sm text-slate-400">
                  {transaction.type === 'membership' ? 'Membership Payment' : 'MLM Commission'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-white">
                  {formatUSDC(transaction.amount)}
                </div>
                <div className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </div>
              </div>

              <button
                onClick={() => window.open(getExplorerUrl(transaction.txHash), '_blank')}
                className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                title="View transaction"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;