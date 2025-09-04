// src/components/payments/NetworkSwitcher.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '@/hooks/useWallet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface NetworkSwitcherProps {
  onNetworkSwitch?: () => void;
}

const NetworkSwitcher: FC<NetworkSwitcherProps> = ({ onNetworkSwitch }) => {
  const { isCorrectChain, chainId, switchToPolygon, getCurrentChain } = useWallet();
  
  if (isCorrectChain) return null;

  const targetChain = getCurrentChain();
  const currentChainName = chainId === 1 ? 'Ethereum' : 
                          chainId === 56 ? 'BSC' :
                          chainId === 137 ? 'Polygon' :
                          chainId === 80001 ? 'Polygon Testnet' :
                          `Chain ${chainId}`;

  const handleSwitch = async () => {
    const success = await switchToPolygon();
    if (success && onNetworkSwitch) {
      onNetworkSwitch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">
              Wrong Network Detected
            </h3>
            <p className="text-amber-200/80 text-sm mb-4">
              You're currently connected to <strong>{currentChainName}</strong>. 
              Please switch to <strong>{targetChain.name}</strong> to use USDC payments.
            </p>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                onClick={handleSwitch}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Switch to {targetChain.name}
              </Button>
              
              <div className="text-xs text-amber-200/60">
                This will prompt MetaMask to switch networks
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default NetworkSwitcher;