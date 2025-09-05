// src/utils/paymentUtils.ts
export const PAYMENT_CONSTANTS = {
  MEMBERSHIP_PRICE: 10,
  MEMBERSHIP_DURATION_DAYS: 28,
  MLM_COMMISSIONS: {
    LEVEL_1: 3.5,
    LEVEL_2_5: 1.0,
  },
  PLATFORM_FEE: 2.5,
  USDC_DECIMALS: 6,
  MIN_MATIC_FOR_GAS: 0.01, // Minimum MATIC needed for gas
};

export function calculateMLMDistribution(amount: number) {
  const level1Commission = PAYMENT_CONSTANTS.MLM_COMMISSIONS.LEVEL_1;
  const level2_5Commission = PAYMENT_CONSTANTS.MLM_COMMISSIONS.LEVEL_2_5 * 4; // 4 levels
  const totalMLMCommissions = level1Commission + level2_5Commission;
  const platformFee = amount - totalMLMCommissions;

  return {
    level1: level1Commission,
    level2_5: PAYMENT_CONSTANTS.MLM_COMMISSIONS.LEVEL_2_5,
    totalMLM: totalMLMCommissions,
    platform: platformFee,
  };
}

export function validatePaymentAmount(amount: string): {
  isValid: boolean;
  error?: string;
} {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Invalid amount' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount < 0.000001) {
    return { isValid: false, error: 'Amount too small' };
  }
  
  if (numAmount > 1000000) {
    return { isValid: false, error: 'Amount too large' };
  }
  
  return { isValid: true };
}

export function formatPaymentError(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error?.code === 4001) {
    return 'Transaction rejected by user.;
  }
  
  if (error?.code === -32603) {
    return 'Transaction failed';
  }
  
  if (error?.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (error?.message?.includes('gas')) {
    return 'Insufficient gas for transaction';
  }
  
  if (error?.message?.includes('rejected')) {
    return 'Transaction rejected';
  }
  
  return error?.message || 'Unknown error occurred';
}