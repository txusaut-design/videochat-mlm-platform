// src/components/payments/PaymentSummary.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  CalendarIcon,
  user.roupIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { formatUSDC } from '@/utils/web3Utils';
import Card from '@/components/ui/Card';

interface PaymentSummaryProps {
  membershipPrice: number;
  membershipDays: number;
  mlmBreakdown: {
    level1: number;
    level2_5: number;
    platform: number;
  };
}

const PaymentSummary: FC<PaymentSummaryProps> = ({
  membershipPrice,
  membershipDays,
  mlmBreakdown
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <h3 className="text-lg font-semibold text-white mb-6">Payment Breakdown</h3>
        
        <div className="space-y-6">
          {/* Membership Details */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="w-5 h-5 text-primary-400" />
              <span className="text-slate-300">Membership Fee</span>
            </div>
            <span className="text-white font-semibold">
              {formatUSDC(membershipPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">Duration</span>
            </div>
            <span className="text-white font-semibold">
              {membershipDays} days
            </span>
          </div>

          {/* MLM Distribution */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <user.roupIcon className="w-4 h-4 mr-2" />
              MLM Distribution
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Level 1 Commission</span>
                <span className="text-green-400">
                  {formatUSDC(mlmBreakdown.level1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Levels 2-5 Commission</span>
                <span className="text-green-400">
                  {formatUSDC(mlmBreakdown.level2_5)} (each)
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-600">
                <span className="text-slate-400">Platform Fee</span>
                <span className="text-slate-300">
                  {formatUSDC(mlmBreakdown.platform)}
                </span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
            <h4 className="text-primary-300 font-medium mb-3 flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
              What You Get
            </h4>
            
            <ul className="space-y-1 text-sm text-primary-200">
              <li>• Access to HD video chat rooms</li>
              <li>• MLM commission earnings</li>
              <li>• Premium platform features</li>
              <li>• 24/7 customer support</li>
            </ul>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-4 border-t-2 border-slate-600">
            <span className="text-lg font-semibold text-white">Total Payment</span>
            <span className="text-2xl font-bold text-white">
              {formatUSDC(membershipPrice)}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PaymentSummary;
