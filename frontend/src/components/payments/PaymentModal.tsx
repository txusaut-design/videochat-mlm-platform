// src/components/payments/PaymentModal.tsx
'use client';

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CreditCardIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import QRCode from 'react-qr-code';
import { useWallet } from '@/hooks/useWallet';
import { paymentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentStep = 'connect' | 'payment' | 'confirmation' | 'success';

const PaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuthStore();
  const {
    isConnected,
    isCorrectChain,
    address,
    usdcBalance,
    sendUSDC,
    connectWallet
  } = useWallet();

  const [currentStep, setCurrentStep] = useState<PaymentStep>('connect');
  const [platformWallet, setPlatformWallet] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [paymentAmount] = useState('10.00'); // 10 USDC membership

  // Load platform wallet address
  useEffect(() => {
    if (isOpen) {
      paymentsApi.getWalletInfo().then(info => {
        setPlatformWallet(info.address);
      }).catch(console.error);
    }
  }, [isOpen]);

  // Update step based on wallet connection
  useEffect(() => {
    if (isConnected && isCorrectChain) {
      setCurrentStep('payment');
    } else if (isConnected && !isCorrectChain) {
      setCurrentStep('connect');
    }
  }, [isConnected, isCorrectChain]);

  const handleConnectWallet = async () => {
    const success = await connectWallet();
    if (success) {
      setCurrentStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!platformWallet || !isConnected) return;

    setIsProcessing(true);
    
    try {
      // Check USDC balance
      if (parseFloat(usdcBalance) < parseFloat(paymentAmount)) {
        throw new Error('Insufficient USDC balance');
      }

      // Send USDC payment
      const tx = await sendUSDC(platformWallet, paymentAmount);
      setTxHash(tx.hash);
      setCurrentStep('confirmation');

      // Wait for transaction confirmation
      toast.loading('Confirming payment...', { id: 'payment-confirm' });
      
      const receipt = await tx.wait();
      toast.dismiss('payment-confirm');

      if (receipt.status === 1) {
        // Verify payment on backend
        await paymentsApi.verifyPayment(tx.hash);
        setCurrentStep('success');
        toast.success('Payment successful! Membership activated.');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
      setCurrentStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
    // Reset state
    setCurrentStep('connect');
    setTxHash('');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'connect':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-slate-400 mb-6">
              Connect your MetaMask wallet to proceed with the payment
            </p>
            <Button
              variant="primary"
              onClick={handleConnectWallet}
              className="w-full"
            >
              Connect Wallet
            </Button>
          </div>
        );

      case 'payment':
        return (
          <div className="py-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Complete Payment
              </h3>
              <p className="text-slate-400">
                Pay {paymentAmount} USDC for 28 days of premium membership
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300">Amount:</span>
                <span className="text-white font-semibold">{paymentAmount} USDC</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300">Your Balance:</span>
                <span className="text-white">{parseFloat(usdcBalance).toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Membership Duration:</span>
                <span className="text-white">28 days</span>
              </div>
            </div>

            {/* QR Code for Mobile */}
            <div className="bg-white p-4 rounded-lg mb-6 flex justify-center">
              <QRCode 
                value={`ethereum:${platformWallet}?value=${parseFloat(paymentAmount) * 1e6}`}
                size={150}
              />
            </div>

            <Button
              variant="primary"
              onClick={handlePayment}
              loading={isProcessing}
              disabled={parseFloat(usdcBalance) < parseFloat(paymentAmount)}
              className="w-full"
            >
              {parseFloat(usdcBalance) < parseFloat(paymentAmount) 
                ? 'Insufficient Balance' 
                : `Pay ${paymentAmount} USDC`
              }
            </Button>
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Confirming Payment
            </h3>
            <p className="text-slate-400 mb-4">
              Please wait while we confirm your payment on the blockchain...
            </p>
            
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="text-sm text-slate-300 mb-1">Transaction Hash:</div>
              <div className="text-xs text-slate-400 break-all">{txHash}</div>
            </div>

            <LoadingSpinner size="large" className="mb-4" />
            <p className="text-sm text-slate-500">
              This may take a few minutes...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Payment Successful!
            </h3>
            <p className="text-slate-400 mb-6">
              Your membership has been activated for 28 days. You now have full access to all premium features.
            </p>
            
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="text-green-300 text-sm">
                ✓ Video chat access enabled<br/>
                ✓ MLM commissions activated<br/>
                ✓ Premium features unlocked
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleSuccess}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
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
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Premium Membership
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Step Content */}
              {renderStep()}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;