// src/app/dashboard/payments/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import { useAuthStore } from '@/store/authStore';
import { paymentsApi } from '@/lib/api';
import { formatUSDC, formatTransactionHash, getExplorerUrl } from '@/utils/web3Utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PaymentModal from '@/components/payments/PaymentModal';
import WalletButton from '@/components/wallet/WalletButton';

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: paymentHistory, isLoading, refetch } = useQuery(
    'payment-history',
    paymentsApi.getPaymentHistory
  );

  const handlePaymentSuccess = () => {
    refetch();
    // Force refresh userData
    window.location.reload();
  };

  const getMembershipStatus = () => {
    if (!user?.membershipExpiresAt) {
      return { status: 'inactive', daysLeft: 0 };
    }

    const expiryDate = new Date(user?.membershipExpiresAt);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      status: daysLeft > 0 ? 'active' : 'expired',
      daysLeft,
      expiryDate
    };
  };

  const membershipStatus = getMembershipStatus();

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
            <h1 className="text-3xl font-bold text-white">Payments</h1>
            <p className="text-slate-400 mt-2">
              Manage your membership and payment history
            </p>
          </div>
          
          <WalletButton />
        </div>

        {/* Membership Status Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                membershipStatus.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {membershipStatus.status === 'active' ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <XCircleIcon className="w-6 h-6" />
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Membership Status
                </h2>
                <p className={`text-sm ${
                  membershipStatus.status === 'active' 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {membershipStatus.status === 'active' 
                    ? `Active - ${membershipStatus.daysLeft} days remaining`
                    : 'Inactive - Purchase membership to access features'
                  }
                </p>
                
                {membershipStatus.status === 'active' && membershipStatus.expiryDate && (
                  <p className="text-xs text-slate-500 mt-1">
                    Expires: {membershipStatus.expiryDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-1">10 USDC</div>
              <div className="text-sm text-slate-400">/ 28 days</div>
              
              <Button
                variant={membershipStatus.status === 'active' ? 'secondary' : 'primary'}
                onClick={() => setShowPaymentModal(true)}
                className="mt-3"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {membershipStatus.status === 'active' ? 'Extend Membership' : 'Purchase Membership'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Benefits Card */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Premium Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CreditCardIcon,
                title: 'Video Chat Access',
                description: 'Join unlimited HD video rooms with up to 10 participants',
                active: user?.hasActiveMembership
              },
              {
                icon: CheckCircleIcon,
                title: 'MLM Commissions',
                description: 'Earn USDC from your referral network across 5 levels',
                active: user?.hasActiveMembership
              },
              {
                icon: ClockIcon,
                title: 'Premium Support',
                description: '24/7 priority customer support and assistance',
                active: user?.hasActiveMembership
              }
            ].map((benefit, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  benefit.active 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-slate-600 bg-slate-700/30'
                }`}
              >
                <benefit.icon className={`w-8 h-8 mb-3 ${
                  benefit.active ? 'text-green-400' : 'text-slate-400'
                }`} />
                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment History */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Payment History</h2>
            {paymentHistory && paymentHistory.length > 0 && (
              <Button variant="ghost" size="small" onClick={() => refetch()}>
                Refresh
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : !paymentHistory || paymentHistory.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Payment History</h3>
              <p className="text-slate-400 mb-6">
                You haven't made any payments yet. Purchase your first membership to get started!
              </p>
              <Button
                variant="primary"
                onClick={() => setShowPaymentModal(true)}
              >
                Purchase Membership
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-400'
                        : payment.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {payment.status === 'confirmed' ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : payment.status === 'pending' ? (
                        <ClockIcon className="w-5 h-5" />
                      ) : (
                        <XCircleIcon className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-white">
                        Membership Payment
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(payment.created_at).toLocaleDateString()} • {formatTransactionHash(payment.transaction_hash)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatUSDC(payment.amount)}
                    </div>
                    <div className="text-sm text-slate-400 capitalize">
                      {payment.status}
                    </div>
                  </div>

                  <button
                    onClick={() => window.open(getExplorerUrl(payment.transaction_hash), '_blank')}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    title="View on Polygonscan"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      </motion.div>
    </div>
  );
}