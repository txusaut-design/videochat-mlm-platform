// src/components/payments/TransactionTracker.tsx
'use client';

import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { getExplorerUrl, formatTransactionHash } from '@/utils/web3Utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  amount?: string;
  type: 'membership' | 'commission';
}

interface TransactionTrackerProps {
  transactions: Transaction[];
  onTransactionUpdate?: (hash: string, status: 'confirmed' | 'failed') => void;
}

const TransactionTracker: FC<TransactionTrackerProps> = ({
  transactions,
  onTransactionUpdate
}) => {
  const { provider } = useWallet();
  const [trackingTxs, setTrackingTxs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!provider) return;

    const pendingTxs = transactions.filter(tx => tx.status === 'pending');
    
    pendingTxs.forEach(tx => {
      if (!trackingTxs.has(tx.hash)) {
        trackTransaction(tx.hash);
      }
    });
  }, [transactions, provider, trackingTxs]);

  const trackTransaction = async (txHash: string) => {
    if (!provider || trackingTxs.has(txHash)) return;

    setTrackingTxs(prev => new Set(prev).add(txHash));

    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx) return;

      const receipt = await tx.wait(1);
      const status = receipt.status === 1 ? 'confirmed' : 'failed';
      
      onTransactionUpdate?.(txHash, status);
    } catch (error) {
      console.error('Error tracking transaction:', error);
      onTransactionUpdate?.(txHash, 'failed');
    } finally {
      setTrackingTxs(prev => {
        const newSet = new Set(prev);
        newSet.delete(txHash);
        return newSet;
      });
    }
  };

  if (transactions.length === 0) return null;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
      
      <div className="space-y-3">
        {transactions.map(tx => (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                tx.status === 'confirmed' 
                  ? 'bg-green-500/20 text-green-400'
                  : tx.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {tx.status === 'confirmed' ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : tx.status === 'pending' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )}
              </div>
              
              <div>
                <div className="text-sm font-medium text-white">
                  {tx.type === 'membership' ? 'Membership Payment' : 'Commission Payment'}
                </div>
                <div className="text-xs text-slate-400">
                  {formatTransactionHash(tx.hash)} • {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {tx.amount && (
                <span className="text-sm font-semibold text-white">
                  {tx.amount} USDC
                </span>
              )}
              
              <button
                onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                className="p-1 hover:bg-slate-600 rounded transition-colors"
                title="View on explorer"
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

export default TransactionTracker;
