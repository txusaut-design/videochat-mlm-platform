// src/components/wallet/WalletButton.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { 
  WalletIcon, 
  ChevronDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '@/hooks/useWallet';
import Button from '@/components/ui/Button';
import { formatAddress } from '@/utils/web3Utils';

interface WalletButtonProps {
  onConnect?: () => void;
  showDropdown?: boolean;
  className?: string;
}

const WalletButton: FC<WalletButtonProps> = ({
  onConnect,
  showDropdown = true,
  className = ''
}) => {
  const {
    isConnected,
    address,
    balance,
    usdcBalance,
    isCorrectChain,
    isConnecting,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    refreshBalances,
  } = useWallet();

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success && onConnect) {
      onConnect();
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <Button
        variant="primary"
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
        className={className}
      >
        Install MetaMask
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        variant="primary"
        loading={isConnecting}
        onClick={handleConnect}
        className={className}
      >
        <WalletIcon className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Wallet Status */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          isCorrectChain 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          <WalletIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatAddress(address || '')}
          </span>
          
          {!isCorrectChain && (
            <ExclamationTriangleIcon className="w-4 h-4" />
          )}
        </div>

        {/* Balances */}
        <div className="bg-slate-700 px-3 py-2 rounded-lg">
          <div className="text-xs text-slate-400">USDC Balance</div>
          <div className="text-sm font-semibold text-white">
            {parseFloat(usdcBalance).toFixed(2)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={refreshBalances}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Refresh balances"
          >
            <ArrowPathIcon className="w-4 h-4 text-slate-400" />
          </button>
          
          {!isCorrectChain && (
            <Button
              variant="danger"
              size="small"
              onClick={switchToPolygon}
            >
              Switch Network
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletButton;