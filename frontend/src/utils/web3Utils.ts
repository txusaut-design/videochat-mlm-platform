// src/utils/web3Utils.ts
import { ethers } from 'ethers';

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: string, decimals: number = 4): string {
  const num = parseFloat(balance);
  if (num === 0) return '0.00';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(decimals);
}

export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

export function formatTransactionHash(hash: string): string {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev 
    ? 'https://mumbai.polygonscan.com' 
    : 'https://polygonscan.com';
  
  return `${baseUrl}/${type}/${hash}`;
}

export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num).replace('$', '') + ' USDC';
}

export function parseUSDCAmount(amount: string): string {
  // Remove any non-numeric characters except decimal point
  const cleaned = amount.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 6 decimal places (USDC precision)
  if (parts[1] && parts[1].length > 6) {
    return parts[0] + '.' + parts[1].slice(0, 6);
  }
  
  return cleaned;
}

export async function waitForTransaction(
  provider: ethers.Provider,
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) return null;
    
    return await tx.wait(confirmations);
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    return null;
  }
}
