// src/hooks/usePaymentFlow.ts
import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { paymentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PaymentState {
  isProcessing: boolean;
  currentStep: 'idle' | 'connecting' | 'confirming' | 'processing' | 'success' | 'error';
  txHash: string | null;
  error: string | null;
}

export function usePaymentFlow() {
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    currentStep: 'idle',
    txHash: null,
    error: null,
  });

  const { isConnected, isCorrectChain, sendUSDC, connectWallet } = useWallet();

  const resetPayment = useCallback(() => {
    setState({
      isProcessing: false,
      currentStep: 'idle',
      txHash: null,
      error: null,
    });
  }, []);

  const processPayment = useCallback(async (
    recipientAddress: string, 
    amount: string
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, currentStep: 'connecting', error: null }));

      // Ensure wallet is connected
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Failed to connect wallet');
        }
      }

      if (!isCorrectChain) {
        throw new Error('Please switch to Polygon network');
      }

      setState(prev => ({ ...prev, currentStep: 'confirming' }));
      
      // Send USDC transaction
      const tx = await sendUSDC(recipientAddress, amount);
      
      setState(prev => ({ ...prev, currentStep: 'processing', txHash: tx.hash }));
      
      // Wait for confirmation
      toast.loading('Confirming transaction...', { id: 'tx-confirm' });
      const receipt = await tx.wait(1);
      toast.dismiss('tx-confirm');

      if (receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // Verify with backend
      await paymentsApi.verifyPayment(tx.hash);
      
      setState(prev => ({ ...prev, currentStep: 'success' }));
      toast.success('Payment successful!');
      
      return true;
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment failed';
      
      setState(prev => ({ 
        ...prev, 
        currentStep: 'error', 
        error: errorMessage 
      }));
      
      toast.error(errorMessage);
      return false;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [isConnected, isCorrectChain, sendUSDC, connectWallet]);

  return {
    ...state,
    processPayment,
    resetPayment,
  };
}
