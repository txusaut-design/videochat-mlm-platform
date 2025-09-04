// src/hooks/useWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  usdcBalance: string;
  chainId: number | null;
  isCorrectChain: boolean;
  provider: ethers.BrowserProvider | null;
}

const POLYGON_CHAIN_ID = 137;
const POLYGON_TESTNET_CHAIN_ID = 80001;
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // Polygon mainnet
const USDC_TESTNET_ADDRESS = '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e'; // Polygon testnet

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    usdcBalance: '0',
    chainId: null,
    isCorrectChain: false,
    provider: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  // Get current chain info
  const getCurrentChain = useCallback(() => {
    const isDev = process.env.NODE_ENV === 'development';
    return {
      chainId: isDev ? POLYGON_TESTNET_CHAIN_ID : POLYGON_CHAIN_ID,
      name: isDev ? 'Polygon Testnet' : 'Polygon Mainnet',
      rpcUrl: isDev ? 'https://rpc-mumbai.maticvigil.com' : 'https://polygon-rpc.com',
      usdcAddress: isDev ? USDC_TESTNET_ADDRESS : USDC_ADDRESS,
    };
  }, []);

  // Check if connected to correct chain
  const isCorrectChain = useCallback((chainId: number) => {
    const targetChainId = getCurrentChain().chainId;
    return chainId === targetChainId;
  }, [getCurrentChain]);

  // Switch to Polygon network
  const switchToPolygon = useCallback(async () => {
    if (!window.ethereum) return false;

    const chain = getCurrentChain();
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chain.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chain.chainId.toString(16)}`,
                chainName: chain.name,
                rpcUrls: [chain.rpcUrl],
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                blockExplorerUrls: [
                  chain.chainId === POLYGON_CHAIN_ID 
                    ? 'https://polygonscan.com' 
                    : 'https://mumbai.polygonscan.com'
                ],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Polygon network:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Polygon network:', switchError);
      return false;
    }
  }, [getCurrentChain]);

  // Get balances
  const getBalances = useCallback(async (provider: ethers.BrowserProvider, address: string) => {
    try {
      // Get MATIC balance
      const maticBalance = await provider.getBalance(address);
      const maticFormatted = ethers.formatEther(maticBalance);

      // Get USDC balance
      const chain = getCurrentChain();
      const usdcContract = new ethers.Contract(
        chain.usdcAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        provider
      );

      const usdcBalance = await usdcContract.balanceOf(address);
      const usdcFormatted = ethers.formatUnits(usdcBalance, 6); // USDC has 6 decimals

      return {
        matic: maticFormatted,
        usdc: usdcFormatted,
      };
    } catch (error) {
      console.error('Error getting balances:', error);
      return { matic: '0', usdc: '0' };
    }
  }, [getCurrentChain]);

  // Update wallet state
  const updateWalletState = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        setWalletState(prev => ({
          ...prev,
          isConnected: false,
          address: null,
          balance: '0',
          usdcBalance: '0',
          provider: null,
        }));
        return;
      }

      const address = accounts[0].address;
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const correctChain = isCorrectChain(chainId);

      let balances = { matic: '0', usdc: '0' };
      
      if (correctChain) {
        balances = await getBalances(provider, address);
      }

      setWalletState({
        isConnected: true,
        address,
        balance: balances.matic,
        usdcBalance: balances.usdc,
        chainId,
        isCorrectChain: correctChain,
        provider,
      });
    } catch (error) {
      console.error('Error updating wallet state:', error);
    }
  }, [isCorrectChain, getBalances]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return false;
    }

    setIsConnecting(true);

    try {
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      await updateWalletState();
      
      // Check if on correct chain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (!isCorrectChain(chainId)) {
        const switched = await switchToPolygon();
        if (switched) {
          await updateWalletState();
        } else {
          toast.error('Please switch to Polygon network');
          return false;
        }
      }

      toast.success('Wallet connected successfully!');
      return true;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Wallet connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled, updateWalletState, isCorrectChain, switchToPolygon]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: '0',
      usdcBalance: '0',
      chainId: null,
      isCorrectChain: false,
      provider: null,
    });
    toast.success('Wallet disconnected');
  }, []);

  // Send USDC
  const sendUSDC = useCallback(async (to: string, amount: string) => {
    if (!walletState.provider || !walletState.address) {
      throw new Error('Wallet not connected');
    }

    if (!walletState.isCorrectChain) {
      throw new Error('Please switch to Polygon network');
    }

    const chain = getCurrentChain();
    const signer = await walletState.provider.getSigner();
    
    const usdcContract = new ethers.Contract(
      chain.usdcAddress,
      [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ],
      signer
    );

    // Check balance
    const balance = await usdcContract.balanceOf(walletState.address);
    const amountWei = ethers.parseUnits(amount, 6);
    
    if (balance < amountWei) {
      throw new Error('Insufficient USDC balance');
    }

    // Send transaction
    const tx = await usdcContract.transfer(to, amountWei);
    return tx;
  }, [walletState, getCurrentChain]);

  // Event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        updateWalletState();
      }
    };

    const handleChainChanged = (chainId: string) => {
      updateWalletState();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Initial check
    updateWalletState();

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [updateWalletState, disconnectWallet]);

  return {
    ...walletState,
    isConnecting,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    sendUSDC,
    refreshBalances: updateWalletState,
    getCurrentChain,
  };
}