import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Quiz from '../models/Quiz';
import mongoose from 'mongoose';

dotenv.config();

async function checkDatabase() {
  try {
    await connectDatabase();

    console.log('\n📊 資料庫檢查:');
    console.log('================');

    const quizCount = await Quiz.countDocuments();
    console.log(`\n✅ Quiz 記錄數: ${quizCount}`);

    if (quizCount > 0) {
      const latestQuizzes = await Quiz.find()
        .sort({ createdAt: -1 })
        .limit(5);

      console.log('\n最近 5 筆 Quiz:');
      latestQuizzes.forEach((quiz, idx) => {
        console.log(`  ${idx + 1}. ID: ${quiz._id}`);
        console.log(`     User: ${quiz.userId}`);
        console.log(`     Book: ${quiz.book}, Difficulty: ${quiz.difficulty}`);
        console.log(`     Score: ${quiz.totalScore} (${quiz.correctCount}/20 正確)`);
        console.log(`     Answer Bitmap: ${quiz.answerBitmap}`);
        console.log(`     Created: ${quiz.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 資料庫連接已關閉');
  }
}

checkDatabase();
