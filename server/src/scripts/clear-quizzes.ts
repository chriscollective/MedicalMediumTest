import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Quiz from '../models/Quiz';
import mongoose from 'mongoose';

dotenv.config();

async function clearQuizzes() {
  try {
    await connectDatabase();

    console.log('\n🗑️  清理資料庫...');
    console.log('================');

    // 刪除所有 Quiz 記錄
    const quizResult = await Quiz.deleteMany({});
    console.log(`✅ 已刪除 ${quizResult.deletedCount} 筆 Quiz 記錄`);

    // 刪除舊的 Answer 記錄（如果 collection 存在）
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasAnswers = collections.some(col => col.name === 'answers');

    if (hasAnswers) {
      const answerResult = await mongoose.connection.db.collection('answers').deleteMany({});
      console.log(`✅ 已刪除 ${answerResult.deletedCount} 筆 Answer 記錄`);
    } else {
      console.log('ℹ️  沒有找到 Answer collection');
    }

    console.log('\n✨ 清理完成！現在可以重新測驗，新的記錄會包含 bitmap 欄位。');

  } catch (error) {
    console.error('❌ 清理失敗:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 資料庫連接已關閉');
  }
}

clearQuizzes();
