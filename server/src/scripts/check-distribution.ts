import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Question from '../models/Question';
import mongoose from 'mongoose';

dotenv.config();

async function checkDistribution() {
  try {
    await connectDatabase();

    console.log('\n📊 題目分佈詳細統計：');
    console.log('======================\n');

    const books = ['神奇西芹汁', '改變生命的食物', '搶救肝臟'];
    const difficulties = ['初階', '進階'];
    const types = ['single', 'multiple', 'fill'];

    for (const book of books) {
      console.log(`\n📚 ${book}`);
      console.log('─'.repeat(40));

      for (const difficulty of difficulties) {
        console.log(`\n  ${difficulty}:`);

        let total = 0;
        for (const type of types) {
          const count = await Question.countDocuments({ book, difficulty, type });
          console.log(`    ${type.padEnd(10)}: ${count} 題`);
          total += count;
        }

        console.log(`    ${'總計'.padEnd(10)}: ${total} 題`);

        // 檢查是否足夠
        if (difficulty === '初階') {
          const singleCount = await Question.countDocuments({ book, difficulty, type: 'single' });
          const multipleCount = await Question.countDocuments({ book, difficulty, type: 'multiple' });
          const fillCount = await Question.countDocuments({ book, difficulty, type: 'fill' });

          const needSingle = 10;
          const needMultiple = 5;
          const needFill = 5;

          console.log(`\n    需求檢查:`);
          console.log(`    單選: ${singleCount}/${needSingle} ${singleCount >= needSingle ? '✅' : '❌ 不足 ' + (needSingle - singleCount) + ' 題'}`);
          console.log(`    多選: ${multipleCount}/${needMultiple} ${multipleCount >= needMultiple ? '✅' : '❌ 不足 ' + (needMultiple - multipleCount) + ' 題'}`);
          console.log(`    填空: ${fillCount}/${needFill} ${fillCount >= needFill ? '✅' : '❌ 不足 ' + (needFill - fillCount) + ' 題'}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n\n👋 資料庫連接已關閉');
  }
}

checkDistribution();
