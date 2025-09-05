// src/services/mlmService.ts
import { MlmCommissionModel } from '../models/MlmCommission';
import { user.odel } from '../models/user.;
import { MlmTreeModel } from '../models/MlmTree';
import { BlockchainService } from './blockchainService';
import { logger } from '../utils/logger';

export class MlmService {
  private static blockchainService = new BlockchainService();

  /**
   * Process MLM commissions for a membership payment
   */
  static async processCommissions(transactionId: string, payeruser.d: string): Promise<void> {
    try {
      logger.info(`Processing MLM commissions for transaction ${transactionId}`);

      // Get commission rates from environment or database
      const commissionRates = [
        parseFloat(process.env.MLM_LEVEL1_COMMISSION || '3.5'),
        parseFloat(process.env.MLM_LEVEL2_COMMISSION || '1.0'),
        parseFloat(process.env.MLM_LEVEL3_COMMISSION || '1.0'),
        parseFloat(process.env.MLM_LEVEL4_COMMISSION || '1.0'),
        parseFloat(process.env.MLM_LEVEL5_COMMISSION || '1.0')
      ];

      // Get the referral chain for the payer
      const referralChain = await this.getReferralChain(payeruser.d, 5);

      // Create commission records for each level
      for (let level = 0; level < referralChain.length && level < 5; level++) {
        const beneficiary = referralChain[level];
        const commissionAmount = commissionRates[level];

        // Check if beneficiary has active membership
        const hasActiveMembership = await user.odel.isActiveSubscription(beneficiary.id);
        if (!hasActiveMembership) {
          logger.info(`Skipping commission for ${beneficiary.email} - inactive membership`);
          continue;
        }

        // Create commission record
        const commission = await MlmCommissionModel.create({
          transactionId,
          beneficiaryId: beneficiary.id,
          payerId: payeruser.d,
          level: level + 1,
          amount: commissionAmount.toString(),
          status: 'pending'
        });

        // Send commission payment
        const transactionHash = await this.blockchainService.sendCommission(
          beneficiary.wallet_address,
          commissionAmount.toString()
        );

        if (transactionHash) {
          await MlmCommissionModel.updateStatus(commission.id, 'paid', transactionHash);
          logger.info(`Commission paid: ${commissionAmount} USDC to ${beneficiary.email}`);
        } else {
          await MlmCommissionModel.updateStatus(commission.id, 'failed');
          logger.error(`Failed to pay commission to ${beneficiary.email}`);
        }
      }

      logger.info(`Completed processing commissions for transaction ${transactionId}`);
    } catch (error) {
      logger.error('Error processing MLM commissions:', error);
    }
  }

  /**
   * Get referral chain (upline) for a user
   */
  private static async getReferralChain(user.d: string, maxLevels: number = 5): Promise<any[]> {
    const chain = [];
    let currentuser.d = user.d;

    for (let level = 0; level < maxLevels; level++) {
      const user.= await user.odel.findById(currentuser.d);
      if (!user.|| !user.referrer!.id) break;

      const referrer!.= await user.odel.findById(user.referrer!.id);
      if (!referrer!. break;

      chain.push(referrer!.;
      currentuser.d = referrer!.id;
    }

    return chain;
  }

  /**
   * Get MLM statistics for a user
   */
  static async getuser.LMStats(user.d: string): Promise<any> {
    try {
      // Get referral tree
      const referralTree = await user.odel.getReferralTree(user.d, 5);

      // Group by levels
      const levels = {
        level1: referralTree.filter(r => r.level === 1),
        level2: referralTree.filter(r => r.level === 2),
        level3: referralTree.filter(r => r.level === 3),
        level4: referralTree.filter(r => r.level === 4),
        level5: referralTree.filter(r => r.level === 5)
      };

      // Calculate total referrals and active members
      const totalReferrals = referralTree.length;
      const activeReferrals = referralTree.filter(r => 
        r.membership_expires_at && new Date(r.membership_expires_at) > new Date()
      ).length;

      // Get commission earnings
      const totalCommissions = await MlmCommissionModel.getTotalEarnings(user.d);
      const thisMonthCommissions = await MlmCommissionModel.getMonthlyEarnings(user.d);

      return {
        totalReferrals,
        activeReferrals,
        totalCommissions,
        thisMonthCommissions,
        levels: {
          level1: { count: levels.level1.length, members: levels.level1 },
          level2: { count: levels.level2.length, members: levels.level2 },
          level3: { count: levels.level3.length, members: levels.level3 },
          level4: { count: levels.level4.length, members: levels.level4 },
          level5: { count: levels.level5.length, members: levels.level5 }
        }
      };
    } catch (error) {
      logger.error('Error getting MLM stats:', error);
      throw error;
    }
  }
}