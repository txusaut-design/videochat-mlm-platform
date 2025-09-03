// src/services/blockchainService.ts
import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { MembershipTransactionModel } from '../models/MembershipTransaction';
import { MlmCommissionModel } from '../models/MlmCommission';
import { UserModel } from '../models/User';
import { MlmService } from './mlmService';

// USDC Contract ABI (simplified - only functions we need)
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private usdcContract: ethers.Contract;
  
  constructor() {
    // Initialize provider for Polygon network
    this.provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    );
    
    // Initialize wallet
    if (!process.env.PLATFORM_PRIVATE_KEY) {
      throw new Error('PLATFORM_PRIVATE_KEY not found in environment variables');
    }
    
    this.wallet = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, this.provider);
    
    // Initialize USDC contract
    const usdcAddress = process.env.USDC_CONTRACT_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    this.usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, this.provider);
  }

  /**
   * Monitor blockchain for incoming USDC payments
   */
  async startPaymentMonitoring(): Promise<void> {
    logger.info('Starting blockchain payment monitoring...');
    
    const platformAddress = await this.wallet.getAddress();
    logger.info(`Platform wallet address: ${platformAddress}`);

    // Listen for Transfer events to platform wallet
    this.usdcContract.on('Transfer', async (from, to, amount, event) => {
      if (to.toLowerCase() === platformAddress.toLowerCase()) {
        await this.handleIncomingPayment(from, to, amount, event);
      }
    });

    // Also check for missed transactions on startup
    await this.processPendingTransactions();
  }

  /**
   * Handle incoming USDC payment
   */
  private async handleIncomingPayment(
    from: string,
    to: string,
    amount: bigint,
    event: any
  ): Promise<void> {
    try {
      const transactionHash = event.log.transactionHash;
      const blockNumber = event.log.blockNumber;
      const blockHash = event.log.blockHash;

      logger.info(`Incoming payment detected: ${transactionHash}`);

      // Convert amount from wei to USDC (6 decimals)
      const usdcAmount = ethers.formatUnits(amount, 6);
      const expectedAmount = process.env.MEMBERSHIP_PRICE_USDC || '10';

      // Check if this is a valid membership payment (10 USDC)
      if (parseFloat(usdcAmount) < parseFloat(expectedAmount)) {
        logger.warn(`Payment amount ${usdcAmount} USDC is less than expected ${expectedAmount} USDC`);
        return;
      }

      // Find user by wallet address
      const user = await UserModel.findByWalletAddress(from);
      if (!user) {
        logger.warn(`Payment from unknown wallet: ${from}`);
        return;
      }

      // Check if transaction already processed
      const existingTransaction = await MembershipTransactionModel.findByTransactionHash(transactionHash);
      if (existingTransaction) {
        logger.info(`Transaction already processed: ${transactionHash}`);
        return;
      }

      // Create transaction record
      const transaction = await MembershipTransactionModel.create({
        userId: user.id,
        transactionHash,
        amount: usdcAmount,
        fromAddress: from,
        toAddress: to,
        blockNumber,
        blockHash,
        status: 'confirmed'
      });

      // Update user membership
      const membershipDays = parseInt(process.env.MEMBERSHIP_DURATION_DAYS || '28');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + membershipDays);
      
      await UserModel.updateMembership(user.id, expiresAt);

      // Process MLM commissions
      await MlmService.processCommissions(transaction.id, user.id);

      logger.info(`Membership updated for user ${user.email} until ${expiresAt}`);

    } catch (error) {
      logger.error('Error handling incoming payment:', error);
    }
  }

  /**
   * Process pending transactions that might have been missed
   */
  private async processPendingTransactions(): Promise<void> {
    try {
      const pendingTransactions = await MembershipTransactionModel.findPending();
      
      for (const transaction of pendingTransactions) {
        const receipt = await this.provider.getTransactionReceipt(transaction.transaction_hash);
        
        if (receipt && receipt.status === 1) {
          // Transaction confirmed
          await MembershipTransactionModel.updateStatus(transaction.id, 'confirmed', {
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash
          });

          // Update user membership
          const membershipDays = parseInt(process.env.MEMBERSHIP_DURATION_DAYS || '28');
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + membershipDays);
          
          await UserModel.updateMembership(transaction.user_id, expiresAt);

          // Process MLM commissions
          await MlmService.processCommissions(transaction.id, transaction.user_id);
          
          logger.info(`Processed pending transaction: ${transaction.transaction_hash}`);
        } else if (receipt && receipt.status === 0) {
          // Transaction failed
          await MembershipTransactionModel.updateStatus(transaction.id, 'failed');
          logger.warn(`Transaction failed: ${transaction.transaction_hash}`);
        }
      }
    } catch (error) {
      logger.error('Error processing pending transactions:', error);
    }
  }

  /**
   * Send USDC commission to user
   */
  async sendCommission(toAddress: string, amount: string): Promise<string | null> {
    try {
      // Convert USDC amount to wei (6 decimals)
      const amountInWei = ethers.parseUnits(amount, 6);
      
      // Create transaction
      const usdcWithSigner = this.usdcContract.connect(this.wallet);
      const transaction = await usdcWithSigner.transfer(toAddress, amountInWei);
      
      logger.info(`Commission sent: ${amount} USDC to ${toAddress}, tx: ${transaction.hash}`);
      
      // Wait for confirmation
      await transaction.wait();
      
      return transaction.hash;
    } catch (error) {
      logger.error('Error sending commission:', error);
      return null;
    }
  }

  /**
   * Get USDC balance of platform wallet
   */
  async getPlatformBalance(): Promise<string> {
    try {
      const platformAddress = await this.wallet.getAddress();
      const balance = await this.usdcContract.balanceOf(platformAddress);
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      logger.error('Error getting platform balance:', error);
      return '0';
    }
  }

  /**
   * Get current network gas price
   */
  async getGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || ethers.parseUnits('30', 'gwei');
    } catch (error) {
      logger.error('Error getting gas price:', error);
      return ethers.parseUnits('30', 'gwei');
    }
  }

  /**
   * Validate Polygon address
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }
}