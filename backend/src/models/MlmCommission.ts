// src/models/MlmCommission.ts
import { pool } from '../config/database';
import { MlmCommission } from '../types/database';

export class MlmCommissionModel {
  static async create(data: {
    transactionId: string;
    beneficiaryId: string;
    payerId: string;
    level: number;
    amount: string;
    status?: string;
  }): Promise<MlmCommission> {
    const query = `
      INSERT INTO mlm_commissions 
      (transaction_id, beneficiary_id, payer_id, level, amount, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.transactionId,
      data.beneficiaryId,
      data.payerId,
      data.level,
      data.amount,
      data.status || 'pending'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id: string, status: string, transactionHash?: string): Promise<void> {
    const query = `
      UPDATE mlm_commissions 
      SET status = $1, paid_at = CURRENT_TIMESTAMP, transaction_hash = $2
      WHERE id = $3
    `;
    await pool.query(query, [status, transactionHash || null, id]);
  }

  static async getTotalEarnings(userId: string): Promise<string> {
    const query = `
      SELECT COALESCE(SUM(amount::decimal), 0) as total
      FROM mlm_commissions 
      WHERE beneficiary_id = $1 AND status = 'paid'
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0].total || '0';
  }

  static async getMonthlyEarnings(userId: string): Promise<string> {
    const query = `
      SELECT COALESCE(SUM(amount::decimal), 0) as total
      FROM mlm_commissions 
      WHERE beneficiary_id = $1 
      AND status = 'paid'
      AND paid_at >= date_trunc('month', CURRENT_DATE)
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0].total || '0';
  }

  static async getUserCommissions(userId: string, limit: number = 50): Promise<MlmCommission[]> {
    const query = `
      SELECT mc.*, 
             u.username as payer_username,
             mt.transaction_hash as membership_transaction_hash
      FROM mlm_commissions mc
      JOIN users u ON mc.payer_id = u.id
      JOIN membership_transactions mt ON mc.transaction_id = mt.id
      WHERE mc.beneficiary_id = $1
      ORDER BY mc.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }
}