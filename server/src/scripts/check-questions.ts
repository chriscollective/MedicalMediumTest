import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

import Question from '../models/Question';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mmquiz');

  const books = ['神奇西芹汁', '搶救肝臟', '改變生命的食物'];
  const difficulties = ['初階', '進階'];

  console.log('📊 題目分布統計：\n');

  for (const book of books) {
    console.log(`📚 ${book}`);
    for (const difficulty of difficulties) {
      const count = await Question.countDocuments({ source: book, difficulty });
      console.log(`   ${difficulty}：${count} 題`);
    }
    console.log('');
  }

  await mongoose.connection.close();
}

check();
