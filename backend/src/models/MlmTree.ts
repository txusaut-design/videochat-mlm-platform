// src/models/MlmTree.ts
import { pool } from '../config/database';
import { MlmTree } from '../types/database';

export class MlmTreeModel {
  static async createNode(userId: string, parentId?: string): Promise<MlmTree> {
    let level = 1;
    let path = userId;

    if (parentId) {
      // Get parent node to determine level and path
      const parentQuery = 'SELECT level, path FROM mlm_tree WHERE user_id = $1';
      const parentResult = await pool.query(parentQuery, [parentId]);
      
      if (parentResult.rows.length > 0) {
        const parent = parentResult.rows[0];
        level = parent.level + 1;
        path = `${parent.path}.${userId}`;
      }
    }

    const query = `
      INSERT INTO mlm_tree (user_id, parent_id, level, path)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [userId, parentId || null, level, path]);
    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<MlmTree | null> {
    const query = 'SELECT * FROM mlm_tree WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async getChildren(userId: string): Promise<MlmTree[]> {
    const query = 'SELECT * FROM mlm_tree WHERE parent_id = $1 ORDER BY created_at';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}
