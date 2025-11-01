import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Question from '../models/Question';
import mongoose from 'mongoose';

dotenv.config();

const missingQuestions = [
  // 改變生命的食物 - 初階 - 多選題 (補1題)
  {
    type: 'multiple',
    question: '以下哪些食物屬於超級食物？（複選）',
    options: ['野生藍莓', '芹菜汁', '大蒜', '薯條', '蜂蜜'],
    correctAnswer: [0, 1, 2, 4],
    source: '《改變生命的食物》',
    explanation: '這些都是具有強大療癒力的超級食物。',
    difficulty: '初階',
    book: '改變生命的食物'
  },

  // 搶救肝臟 - 初階 - 填空題 (補1題)
  {
    type: 'fill',
    question: '肝臟在___時段進行深層清潔和修復。',
    fillOptions: ['早晨', '中午', '下午', '夜間', '運動時', '進食時'],
    correctAnswer: 3,
    source: '《搶救肝臟》',
    explanation: '肝臟在夜間睡眠時進行深層清潔和修復工作。',
    difficulty: '初階',
    book: '搶救肝臟'
  }
];

async function fixMissingQuestions() {
  try {
    await connectDatabase();

    console.log('\n🔧 修復缺少的題目...\n');

    const result = await Question.insertMany(missingQuestions);

    console.log(`✅ 成功補充 ${result.length} 題！\n`);

    // 再次檢查
    console.log('📊 驗證結果：');
    console.log('=============\n');

    const books = [
      { name: '改變生命的食物', type: 'multiple' },
      { name: '搶救肝臟', type: 'fill' }
    ];

    for (const { name, type } of books) {
      const count = await Question.countDocuments({
        book: name,
        difficulty: '初階',
        type
      });
      const status = count >= 5 ? '✅' : '❌';
      console.log(`${name} - 初階 - ${type}: ${count}/5 ${status}`);
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 資料庫連接已關閉');
  }
}

fixMissingQuestions();
