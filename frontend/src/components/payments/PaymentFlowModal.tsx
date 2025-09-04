// src/components/payments/PaymentFlowModal.tsx
'use client';

import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  WalletIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { useWallet } from '@/hooks/useWallet';
import { paymentsApi } from '@/lib/api';
import { formatUSDC, getExplorerUrl } from '@/utils/web3Utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PaymentSummary from './PaymentSummary';
import NetworkSwitcher from './NetworkSwitcher';
import { useState } from 'react';

interface PaymentFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: string;
  purpose?: string;
}

const PaymentFlowModal: FC<PaymentFlowModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount = '10.00',
  purpose = 'Premium Membership'
}) => {
  const [platformWallet, setPlatformWallet] = useState('');
  const { isConnected, isCorrectChain } = useWallet();
  const { currentStep, txHash, error, processPayment, resetPayment } = usePaymentFlow();

  // Load platform wallet
  useEffect(() => {
    if (isOpen) {
      paymentsApi.getWalletInfo()
        .then(info => setPlatformWallet(info.address))
        .catch(console.error);
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      resetPayment();
    }
  }, [isOpen, resetPayment]);

  const handlePayment = async () => {
    if (!platformWallet) return;
    
    const success = await processPayment(platformWallet, amount);
    if (success) {
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'idle':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {purpose}
              </h3>
              <p className="text-slate-400">
                Complete your payment to activate premium features
              </p>
            </div>

            <NetworkSwitcher />

            <PaymentSummary
              membershipPrice={parseFloat(amount)}
              membershipDays={28}
              mlmBreakdown={{
                level1: 3.5,
                level2_5: 1.0,
                platform: 2.5
              }}
            />

            <Button
              variant="primary"
              onClick={handlePayment}
              disabled={!isConnected || !isCorrectChain || !platformWallet}
              className="w-full"
            >
              {!isConnected ? 'Connect Wallet First' : 
               !isCorrectChain ? 'Switch to Polygon' :
               `Pay ${formatUSDC(amount)}`}
            </Button>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center py-8">
            <WalletIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connecting Wallet</h3>
            <p className="text-slate-400 mb-6">Please approve the connection in MetaMask</p>
            <LoadingSpinner size="large" />
          </div>
        );

      case 'confirming':
        return (
          <div className="text-center py-8">
            <CreditCardIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Confirm Payment</h3>
            <p className="text-slate-400 mb-6">Please confirm the transaction in MetaMask</p>
            <LoadingSpinner size="large" />
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <ClockIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
            <p className="text-slate-400 mb-4">
              Your transaction is being processed on the blockchain...
            </p>
            
            {txHash && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Transaction Hash:</span>
                  <button
                    onClick={() => window.open(getExplorerUrl(txHash), '_blank')}
                    className="text-primary-400 hover:text-primary-300 text-sm flex items-center"
                  >
                    View on Explorer
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1 break-all">{txHash}</div>
              </div>
            )}

            <LoadingSpinner size="large" />
            <p className="text-sm text-slate-500 mt-4">This may take a few minutes...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Payment Successful!</h3>
            <p className="text-slate-400 mb-6">
              Your membership has been activated and you now have access to all premium features.
            </p>
            
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="text-green-300 text-sm">
                ✓ Premium membership activated<br/>
                ✓ Video chat access enabled<br/>
                ✓ MLM commissions unlocked<br/>
                ✓ Valid for 28 days
              </div>
            </div>

            {txHash && (
              <button
                onClick={() => window.open(getExplorerUrl(txHash), '_blank')}
                className="text-primary-400 hover:text-primary-300 text-sm flex items-center justify-center mx-auto mb-4"
              >
                View Transaction
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Payment Failed</h3>
            <p className="text-slate-400 mb-6">{error}</p>
            
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button variant="primary" onClick={() => resetPayment()} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={currentStep === 'idle' ? onClose : undefined}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <Card>
              {/* Header */}
              {currentStep === 'idle' && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Complete Payment</h2>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              )}

              {/* Step Content */}
              {getStepContent()}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentFlowModal;
