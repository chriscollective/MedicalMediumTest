import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Question from '../models/Question';
import mongoose from 'mongoose';

dotenv.config();

async function listQuestions() {
  try {
    await connectDatabase();

    console.log('\n📊 資料庫題目統計:');
    console.log('================\n');

    const total = await Question.countDocuments();
    console.log(`總題數: ${total}\n`);

    // 按書籍統計
    const byBook = await Question.aggregate([
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('按書籍統計:');
    byBook.forEach(item => console.log(`  ${item._id}: ${item.count} 題`));

    // 按難度統計
    const byDifficulty = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('\n按難度統計:');
    byDifficulty.forEach(item => console.log(`  ${item._id}: ${item.count} 題`));

    // 按類型統計
    const byType = await Question.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('\n按類型統計:');
    byType.forEach(item => console.log(`  ${item._id}: ${item.count} 題`));

    // 顯示前 5 題
    const samples = await Question.find().limit(5);
    console.log('\n前 5 題範例:');
    samples.forEach((q, idx) => {
      console.log(`\n  ${idx + 1}. ${q.question}`);
      console.log(`     書籍: ${q.book}, 難度: ${q.difficulty}, 類型: ${q.type}`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 資料庫連接已關閉');
  }
}

listQuestions();
