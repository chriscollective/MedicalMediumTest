import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Leaderboard from '../models/Leaderboard';
import mongoose from 'mongoose';

dotenv.config();

// 等級優先順序
const gradeOrder: Record<string, number> = {
  'S': 1,
  'A+': 2,
  'A': 3,
  'B+': 4,
  'B': 5,
  'C+': 6,
  'F': 7
};

// 難度優先順序（支援中英文）
const difficultyOrder: Record<string, number> = {
  '進階': 1,
  'advanced': 1,
  '初階': 2,
  'beginner': 2
};

/**
 * 比較兩個成績（回傳負數表示 a 較優）
 */
function compareScores(
  a: { grade: string; difficulty: string; createdAt: Date },
  b: { grade: string; difficulty: string; createdAt: Date }
): number {
  // 1. 比較等級（等級高的在前面）
  const gradeA = gradeOrder[a.grade];
  const gradeB = gradeOrder[b.grade];
  if (gradeA !== gradeB) {
    return gradeA - gradeB;
  }

  // 2. 比較難度（進階 > 初階）
  const diffA = difficultyOrder[a.difficulty] || 999;
  const diffB = difficultyOrder[b.difficulty] || 999;
  if (diffA !== diffB) {
    return diffA - diffB;
  }

  // 3. 比較時間（越早越優）
  return a.createdAt.getTime() - b.createdAt.getTime();
}

async function recalculateLeaderboard() {
  try {
    await connectDatabase();

    console.log('\n🔄 重新計算排行榜排名...');
    console.log('================\n');

    // 定義書籍列表
    const books = ['神奇西芹汁', '搶救肝臟', '改變生命的食物', '綜合'];

    for (const book of books) {
      console.log(`📚 處理書籍: ${book}`);

      // 1. 取得該書籍所有榜單記錄
      const allEntries = await Leaderboard.find({ book }).lean();
      console.log(`   目前記錄數: ${allEntries.length}`);

      if (allEntries.length === 0) {
        console.log(`   ⚠️  沒有記錄，跳過\n`);
        continue;
      }

      // 2. 按照規則排序（等級 > 難度 > 時間）
      const sortedEntries = allEntries.sort((a, b) => compareScores(
        {
          grade: a.grade,
          difficulty: a.difficulty,
          createdAt: a.createdAt
        },
        {
          grade: b.grade,
          difficulty: b.difficulty,
          createdAt: b.createdAt
        }
      ));

      console.log('   排序結果:');
      sortedEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.displayName} - ${entry.grade} (${entry.difficulty}) - ${new Date(entry.createdAt).toLocaleString('zh-TW')}`);
      });

      // 3. 只保留前100名（或現有記錄數，取較小值）
      const top100 = sortedEntries.slice(0, Math.min(100, sortedEntries.length));

      // 4. 刪除該書籍所有舊記錄
      await Leaderboard.deleteMany({ book });
      console.log(`   🗑️  已刪除所有舊記錄`);

      // 5. 批次插入新記錄（帶正確排名）
      // 轉換難度值：英文 -> 中文
      const difficultyMap: Record<string, string> = {
        'beginner': '初階',
        'advanced': '進階',
        '初階': '初階',
        '進階': '進階'
      };

      const newEntries = top100.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        displayName: entry.displayName,
        book: entry.book,
        difficulty: difficultyMap[entry.difficulty] || entry.difficulty,
        grade: entry.grade,
        score: entry.score,
        createdAt: entry.createdAt
      }));

      if (newEntries.length > 0) {
        await Leaderboard.insertMany(newEntries);
        console.log(`   ✅ 已插入 ${newEntries.length} 筆新記錄\n`);
      }
    }

    console.log('✨ 所有榜單重新計算完成！');
    console.log('\n排序規則:');
    console.log('  1️⃣  等級優先 (S > A+ > A > B+ > B > C+ > F)');
    console.log('  2️⃣  難度次之 (進階 > 初階)');
    console.log('  3️⃣  時間最後 (越早越前面)\n');

  } catch (error) {
    console.error('❌ 重新計算失敗:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 資料庫連接已關閉');
  }
}

recalculateLeaderboard();
