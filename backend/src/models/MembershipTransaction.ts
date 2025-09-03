// src/models/MembershipTransaction.ts
import { pool } from '../config/database';
import { MembershipTransaction } from '../types/database';

export class MembershipTransactionModel {
  static async create(data: {
    userId: string;
    transactionHash: string;
    amount: string;
    fromAddress: string;
    toAddress: string;
    blockNumber?: number;
    blockHash?: string;
    status?: string;
  }): Promise<MembershipTransaction> {
    const query = `
      INSERT INTO membership_transactions 
      (user_id, transaction_hash, amount, from_address, to_address, block_number, block_hash, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.userId,
      data.transactionHash,
      data.amount,
      data.fromAddress,
      data.toAddress,
      data.blockNumber || null,
      data.blockHash || null,
      data.status || 'pending'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByTransactionHash(transactionHash: string): Promise<MembershipTransaction | null> {
    const query = 'SELECT * FROM membership_transactions WHERE transaction_hash = $1';
    const result = await pool.query(query, [transactionHash]);
    return result.rows[0] || null;
  }

  static async findPending(): Promise<MembershipTransaction[]> {
    const query = 'SELECT * FROM membership_transactions WHERE status = $1';
    const result = await pool.query(query, ['pending']);
    return result.rows;
  }

  static async updateStatus(id: string, status: string, additionalData?: any): Promise<void> {
    let query = 'UPDATE membership_transactions SET status = $1, processed_at = CURRENT_TIMESTAMP';
    const values: any[] = [status];

    if (additionalData?.blockNumber) {
      query += ', block_number = $3';
      values.push(id, additionalData.blockNumber);
    }
    if (additionalData?.blockHash) {
      query += ', block_hash = $4';
      values.push(additionalData.blockHash);
    }

    query += ' WHERE id = $2';
    if (values.length === 2) {
      values.push(id);
    } else {
      values.splice(1, 0, id);
    }

    await pool.query(query, values);
  }
}
