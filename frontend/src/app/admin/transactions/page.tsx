// src/app/admin/transactions/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatUSDC, getExplorerUrl, formatTransactionHash } from '@/utils/web3Utils';

// Mock API function
const fetchTransactions = async (page = 1, search = '', status = 'all', type = 'all') => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const allTransactions = [
    {
      id: '1',
      txHash: '0x1234567890abcdef1234567890abcdef12345678',
      username: 'john_doe',
      email: 'john@example.com',
      type: 'membership',
      amount: '10.00',
      status: 'confirmed',
      blockNumber: 12345678,
      gasUsed: '21000',
      timestamp: '2024-11-21T10:30:00Z',
      fromAddress: '0xuser123...',
      toAddress: '0xplatform...'
    },
    {
      id: '2',
      txHash: '0x2345678901bcdef12345678901bcdef123456789',
      username: 'alice_smith',
      email: 'alice@example.com',
      type: 'commission',
      amount: '3.50',
      status: 'pending',
      blockNumber: null,
      gasUsed: null,
      timestamp: '2024-11-21T09:15:00Z',
      fromAddress: '0xplatform...',
      toAddress: '0xalice456...'
    },
    {
      id: '3',
      txHash: '0x3456789012cdef123456789012cdef1234567890',
      username: 'bob_wilson',
      email: 'bob@example.com',
      type: 'membership',
      amount: '10.00',
      status: 'confirmed',
      blockNumber: 12345677,
      gasUsed: '21000',
      timestamp: '2024-11-21T08:45:00Z',
      fromAddress: '0xbob789...',
      toAddress: '0xplatform...'
    },
    {
      id: '4',
      txHash: '0x456789013def123456789013def12345678901a',
      username: 'carol_jones',
      email: 'carol@example.com',
      type: 'commission',
      amount: '1.00',
      status: 'failed',
      blockNumber: 12345676,
      gasUsed: '0',
      timestamp: '2024-11-21T07:20:00Z',
      fromAddress: '0xplatform...',
      toAddress: '0xcarol012...'
    }
  ];

  // Apply filters
  let filteredTransactions = allTransactions;
  
  if (search) {
    filteredTransactions = filteredTransactions.filter(tx => 
      tx.username.toLowerCase().includes(search.toLowerCase()) ||
      tx.email.toLowerCase().includes(search.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
  }

  if (type !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
  }

  return {
    transactions: filteredTransactions.slice((page - 1) * 10, page * 10),
    total: filteredTransactions.length,
    totalPages: Math.ceil(filteredTransactions.length / 10),
    summary: {
      totalRevenue: allTransactions
        .filter(tx => tx.status === 'confirmed')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
      pendingAmount: allTransactions
        .filter(tx => tx.status === 'pending')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
      failedCount: allTransactions.filter(tx => tx.status === 'failed').length
    }
  };
};

export default function AdminTransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'membership' | 'commission'>('all');

  const { data: txData, isLoading } = useQuery(
    ['admin-transactions', currentPage, searchTerm, statusFilter, typeFilter],
    () => fetchTransactions(currentPage, searchTerm, statusFilter, typeFilter),
    { keepPreviousData: true }
  );

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

  const getStatusBadge = (status: string) => {
    const configs = {
      confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${configs[status as keyof typeof configs]}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'membership' ? 'text-blue-400' : 'text-purple-400';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 mr-3" />
              Transaction Management
            </h1>
            <p className="text-slate-400 mt-2">
              Monitor and manage all platform transactions
            </p>
          </div>
          
          <Button variant="primary">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Summary Cards */}
        {txData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatUSDC(txData.summary.totalRevenue.toString())}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {formatUSDC(txData.summary.pendingAmount.toString())}
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Failed Transactions</p>
                  <p className="text-2xl font-bold text-red-400">
                    {txData.summary.failedCount}
                  </p>
                </div>
                <XCircleIcon className="w-8 h-8 text-red-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                <option value="membership">Membership</option>
                <option value="commission">Commission</option>
              </select>

              <Button variant="ghost" size="small">
                <FunnelIcon className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : !txData?.transactions.length ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Transactions Found</h3>
              <p className="text-slate-400">No transactions match your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700">
                  <tr className="text-left">
                    <th className="pb-3 text-sm font-medium text-slate-400">Transaction</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">User</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Type</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Amount</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Status</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Date</th>
                    <th className="pb-3 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {txData.transactions.map((tx, index) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/30"
                    >
                      <td className="py-4">
                        <div className="font-mono text-sm text-white">
                          {formatTransactionHash(tx.txHash)}
                        </div>
                        {tx.blockNumber && (
                          <div className="text-xs text-slate-500">
                            Block: {tx.blockNumber.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-4">
                        <div className="font-medium text-white">{tx.username}</div>
                        <div className="text-sm text-slate-400">{tx.email}</div>
                      </td>

                      <td className="py-4">
                        <span className={`font-medium capitalize ${getTypeColor(tx.type)}`}>
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="font-semibold text-white">
                          {formatUSDC(tx.amount)}
                        </div>
                      </td>

                      <td className="py-4">
                        {getStatusBadge(tx.status)}
                      </td>

                      <td className="py-4">
                        <div className="text-sm text-white">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="py-4">
                        <button
                          onClick={() => window.open(getExplorerUrl(tx.txHash), '_blank')}
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="View on blockchain explorer"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}