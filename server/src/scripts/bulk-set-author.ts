import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import Question from '../models/Question';

dotenv.config();

/**
 * 將目前題庫中所有題目的 createdBy / updatedBy 統一設為 "Chris"
 * 使用方式：
 *   npx tsx server/src/scripts/bulk-set-author.ts
 */
async function bulkSetAuthor() {
  try {
    await connectDatabase();

    const res = await Question.updateMany(
      {},
      {
        $set: {
          createdBy: 'Chris',
          updatedBy: 'Chris',
        },
      }
    );

    console.log(`已更新題目筆數: ${res.modifiedCount}`);
  } catch (err) {
    console.error('更新失敗:', err);
  } finally {
    try { await mongoose.connection.close(); } catch {}
  }
}

bulkSetAuthor();
