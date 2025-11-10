/**
 * 自動完成測驗腳本
 *
 * 功能：
 * - 隨機選擇書籍和難度
 * - 自動建立測驗
 * - 產生隨機答案
 * - 提交測驗並顯示結果
 *
 * 用途：
 * - 產生測試資料
 * - 測試排行榜系統
 * - 驗證測驗流程
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// 載入環境變數
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

import Question from '../models/Question';
import Quiz from '../models/Quiz';

// 書籍選項
const BOOKS = ['神奇西芹汁', '搶救肝臟', '改變生命的食物'];

// 難度選項
const DIFFICULTIES = ['初階', '進階'];

/**
 * 產生隨機答案
 */
function generateRandomAnswer(question: any): number | number[] {
  const optionsCount = question.options.length;

  if (question.type === 'single') {
    // 單選：隨機選擇一個選項（0 到 optionsCount-1）
    return Math.floor(Math.random() * optionsCount);
  } else if (question.type === 'multiple') {
    // 多選：隨機選擇 1 到 optionsCount 個選項
    const numAnswers = Math.floor(Math.random() * optionsCount) + 1;
    const answers = new Set<number>();

    while (answers.size < numAnswers) {
      answers.add(Math.floor(Math.random() * optionsCount));
    }

    return Array.from(answers).sort((a, b) => a - b);
  } else if (question.type === 'cloze') {
    // 克漏字：隨機選擇多個選項（數量與正確答案相同）
    const correctAnswer = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];

    const numBlanks = correctAnswer.length;
    const answers: number[] = [];

    for (let i = 0; i < numBlanks; i++) {
      answers.push(Math.floor(Math.random() * optionsCount));
    }

    return answers;
  }

  return 0;
}

/**
 * 執行單次測驗
 */
async function runSingleQuiz(quizNumber?: number) {
  const prefix = quizNumber ? `[測驗 ${quizNumber}] ` : '';

  try {

    // 隨機選擇書籍和難度
    const book = BOOKS[Math.floor(Math.random() * BOOKS.length)];
    const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
    const userId = uuidv4(); // 產生 UUID

    console.log(`${prefix}📚 測驗設定：`);
    console.log(`${prefix}   書籍：${book}`);
    console.log(`${prefix}   難度：${difficulty}`);
    console.log(`${prefix}   使用者：${userId}\n`);

    // 1. 取得題目（隨機抽取 20 題）
    console.log(`${prefix}📝 正在抽取題目...`);
    const questions = await Question.aggregate([
      { $match: { book, difficulty } },
      { $sample: { size: 20 } }
    ]);

    if (questions.length < 20) {
      console.log(`${prefix}❌ 題目數量不足（僅有 ${questions.length} 題）`);
      console.log(`${prefix}   建議：請先執行 npm run migrate:questions 匯入題目`);
      throw new Error('題目數量不足');
    }

    console.log(`${prefix}✅ 已抽取 ${questions.length} 題\n`);

    // 2. 建立測驗記錄
    console.log(`${prefix}🆕 建立測驗記錄...`);
    const quiz = await Quiz.create({
      userId,
      book,
      difficulty,
      questions: questions.map(q => q._id)
      // answerBitmap, correctCount, totalScore 會使用模型預設值
    });

    console.log(`${prefix}✅ 測驗記錄已建立（ID: ${quiz._id}）\n`);

    // 3. 產生隨機答案
    console.log(`${prefix}🎲 正在產生隨機答案...`);
    const answers: (number | number[])[] = [];

    for (const question of questions) {
      const answer = generateRandomAnswer(question);
      answers.push(answer);
    }

    console.log(`${prefix}✅ 已產生 ${answers.length} 個隨機答案\n`);

    // 4. 計算成績
    console.log(`${prefix}📊 正在計算成績...`);
    let correctCount = 0;
    let answerBitmap = '';

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = answers[i];
      const correctAnswer = question.correctAnswer;

      let isCorrect = false;

      if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
        // 多選或克漏字：長度相同且每個元素都匹配
        isCorrect = correctAnswer.length === userAnswer.length &&
          correctAnswer.every((ans: number) => userAnswer.includes(ans));
      } else {
        // 單選：直接比較
        isCorrect = correctAnswer === userAnswer;
      }

      if (isCorrect) {
        correctCount++;
        answerBitmap += '1';
      } else {
        answerBitmap += '0';
      }
    }

    const totalScore = Math.round((correctCount / questions.length) * 100);

    // 計算等級
    function calculateGrade(score: number): string {
      if (score === 100) return 'S';
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B+';
      if (score >= 60) return 'B';
      if (score >= 50) return 'C+';
      return 'F';
    }

    const grade = calculateGrade(totalScore);

    console.log(`${prefix}✅ 成績計算完成\n`);

    // 5. 更新測驗記錄
    console.log(`${prefix}💾 正在更新測驗記錄...`);
    quiz.answers = answers;
    quiz.answerBitmap = answerBitmap;
    quiz.correctCount = correctCount;
    quiz.totalScore = totalScore;
    quiz.grade = grade;
    quiz.completedAt = new Date();
    await quiz.save();

    console.log(`${prefix}✅ 測驗記錄已更新\n`);

    // 6. 顯示結果
    console.log(`${prefix}═══════════════════════════════════════`);
    console.log(`${prefix}🎉 測驗完成！`);
    console.log(`${prefix}═══════════════════════════════════════`);
    console.log(`${prefix}📚 書籍：${book}`);
    console.log(`${prefix}📈 難度：${difficulty}`);
    console.log(`${prefix}✅ 答對：${correctCount} / ${questions.length} 題`);
    console.log(`${prefix}📊 分數：${totalScore} 分`);
    console.log(`${prefix}🏆 等級：${grade}`);
    console.log(`${prefix}🆔 測驗 ID：${quiz._id}`);
    console.log(`${prefix}👤 使用者 ID：${userId}`);
    console.log(`${prefix}═══════════════════════════════════════\n`);

    // 返回結果
    return {
      success: true,
      quizId: quiz._id.toString(),
      score: totalScore,
      grade,
      book,
      difficulty
    };

  } catch (error) {
    console.error(`${prefix}❌ 錯誤：`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤'
    };
  }
}

/**
 * 主函數
 */
async function main() {
  // 從命令列參數取得次數（預設為 1）
  const args = process.argv.slice(2);
  const count = args[0] ? parseInt(args[0], 10) : 1;

  if (isNaN(count) || count < 1) {
    console.error('❌ 錯誤：次數必須是大於 0 的整數');
    console.log('使用方法：npm run quiz:auto -- <次數>');
    console.log('範例：npm run quiz:auto -- 5');
    process.exit(1);
  }

  try {
    console.log(`🎮 開始自動完成測驗（共 ${count} 筆）...\n`);

    // 連接資料庫
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmquiz';
    await mongoose.connect(mongoUri);
    console.log('✅ 已連接到資料庫\n');

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // 執行多次測驗
    for (let i = 1; i <= count; i++) {
      const result = await runSingleQuiz(count > 1 ? i : undefined);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      // 每次測驗之間稍微延遲，避免 userId 重複
      if (i < count) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 顯示總結
    if (count > 1) {
      console.log('\n');
      console.log('═══════════════════════════════════════');
      console.log('📊 執行總結');
      console.log('═══════════════════════════════════════');
      console.log(`✅ 成功：${successCount} 筆`);
      console.log(`❌ 失敗：${failCount} 筆`);
      console.log(`📝 總計：${count} 筆`);
      console.log('═══════════════════════════════════════\n');

      // 顯示成功的測驗摘要
      if (successCount > 0) {
        console.log('📋 成功測驗摘要：');
        results.forEach((result, index) => {
          if (result.success) {
            console.log(`  ${index + 1}. ${result.book} (${result.difficulty}) - ${result.score}分 (${result.grade})`);
          }
        });
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ 錯誤：', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ 資料庫連線已關閉');
  }
}

// 執行腳本
main();
