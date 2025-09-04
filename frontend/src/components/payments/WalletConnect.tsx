// src/components/payments/WalletConnect.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@/hooks/useWallet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import WalletButton from '../wallet/WalletButton';

interface WalletConnectProps {
  onConnect?: () => void;
  showBalance?: boolean;
  className?: string;
}

const WalletConnect: FC<WalletConnectProps> = ({
  onConnect,
  showBalance = true,
  className = ''
}) => {
  const { 
    isConnected, 
    isMetaMaskInstalled, 
    address, 
    usdcBalance,
    isCorrectChain,
    connectWallet 
  } = useWallet();

  if (!isMetaMaskInstalled) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <WalletIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">MetaMask Required</h3>
          <p className="text-slate-400 mb-6">
            Please install MetaMask to connect your wallet and make payments.
          </p>
          <Button
            variant="primary"
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
          >
            Install MetaMask
          </Button>
        </div>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <WalletIcon className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-slate-400 mb-6">
            Connect your MetaMask wallet to start making payments with USDC.
          </p>
          <Button
            variant="primary"
            onClick={async () => {
              const success = await connectWallet();
              if (success && onConnect) onConnect();
            }}
          >
            Connect Wallet
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCorrectChain 
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isCorrectChain ? (
                <WalletIcon className="w-5 h-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
            </div>
            
            <div>
              <div className="font-semibold text-white">
                Wallet Connected
              </div>
              <div className="text-sm text-slate-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
          </div>

          {showBalance && (
            <div className="text-right">
              <div className="text-sm text-slate-400">USDC Balance</div>
              <div className="text-lg font-semibold text-white">
                {parseFloat(usdcBalance).toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {!isCorrectChain && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="text-amber-300 text-sm">
              ⚠️ Please switch to Polygon network to use USDC payments
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default WalletConnect;