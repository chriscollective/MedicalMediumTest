import { Request, Response, NextFunction } from 'express';
import Leaderboard from '../models/Leaderboard';

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

// 難度優先順序
const difficultyOrder: Record<string, number> = {
  '進階': 1,
  '初階': 2
};

/**
 * 計算等級
 */
function calculateGrade(score: number): string {
  if (score === 100) return 'S';
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  return 'F';
}

/**
 * 比較兩個成績（回傳負數表示 a 較優）
 */
function compareScores(
  a: { grade: string; difficulty: string; createdAt: Date },
  b: { grade: string; difficulty: string; createdAt: Date }
): number {
  // 1. 比較等級
  const gradeA = gradeOrder[a.grade];
  const gradeB = gradeOrder[b.grade];
  if (gradeA !== gradeB) {
    return gradeA - gradeB;
  }

  // 2. 比較難度
  const diffA = difficultyOrder[a.difficulty] || 999;
  const diffB = difficultyOrder[b.difficulty] || 999;
  if (diffA !== diffB) {
    return diffA - diffB;
  }

  // 3. 比較時間（越早越優）
  return a.createdAt.getTime() - b.createdAt.getTime();
}

/**
 * 檢查是否上榜
 * POST /api/leaderboard/check
 * Body: { userId, book, difficulty, score }
 */
export async function checkLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, book, difficulty, score } = req.body;

    if (!userId || !book || !difficulty || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const grade = calculateGrade(score);
    const newScore = {
      grade,
      difficulty,
      createdAt: new Date(),
      score
    };

    // 1. 檢查該使用者在此書籍是否已經上榜
    const existingEntry = await Leaderboard.findOne({ userId, book });

    if (existingEntry) {
      // 比較新舊成績
      const comparison = compareScores(newScore, {
        grade: existingEntry.grade,
        difficulty: existingEntry.difficulty,
        createdAt: existingEntry.createdAt
      });

      if (comparison >= 0) {
        // 新成績沒有更好，不上榜
        return res.json({
          success: true,
          data: {
            qualified: false,
            reason: 'existing_better',
            message: '你已經有更好的成績在榜上了！'
          }
        });
      }

      // 新成績更好，需要更新（後續處理）
    }

    // 2. 取得該書籍目前的榜單（最多5筆）
    const currentLeaderboard = await Leaderboard.find({ book })
      .sort({ rank: 1 })
      .limit(5)
      .lean();

    // 3. 判斷是否能進榜
    if (currentLeaderboard.length < 5) {
      // 榜單未滿，直接上榜
      return res.json({
        success: true,
        data: {
          qualified: true,
          rank: currentLeaderboard.length + 1,
          reason: 'direct_entry'
        }
      });
    }

    // 4. 榜單已滿，比較最後一名
    const lastEntry = currentLeaderboard[4];
    const comparison = compareScores(newScore, {
      grade: lastEntry.grade,
      difficulty: lastEntry.difficulty,
      createdAt: lastEntry.createdAt
    });

    if (comparison < 0) {
      // 成績比第5名好，可以上榜
      return res.json({
        success: true,
        data: {
          qualified: true,
          rank: 5, // 暫定第5名，實際排名會在提交時重新計算
          reason: 'replace_last'
        }
      });
    }

    // 5. 成績不夠好，無法上榜
    return res.json({
      success: true,
      data: {
        qualified: false,
        reason: 'score_too_low',
        message: '成績未達榜單標準'
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 提交榜單名稱並更新榜單
 * POST /api/leaderboard/submit
 * Body: { userId, book, difficulty, score, displayName }
 */
export async function submitLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('📝 提交榜單請求:', req.body);
    const { userId, book, difficulty, score, displayName } = req.body;

    if (!userId || !book || !difficulty || score === undefined || !displayName) {
      console.log('❌ 缺少必要欄位');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const grade = calculateGrade(score);
    const now = new Date();
    console.log('✅ 計算等級:', grade, '分數:', score);

    // 1. 取得該書籍目前的所有榜單記錄
    const currentLeaderboard = await Leaderboard.find({ book }).lean();
    console.log('📊 目前榜單記錄數:', currentLeaderboard.length);

    // 2. 移除該使用者的舊記錄（如果存在）
    const filteredLeaderboard = currentLeaderboard.filter(entry => entry.userId !== userId);
    console.log('📊 移除舊記錄後:', filteredLeaderboard.length);

    // 3. 加入新記錄
    const allEntries = [
      ...filteredLeaderboard.map(entry => ({
        userId: entry.userId,
        displayName: entry.displayName,
        book: entry.book,
        difficulty: entry.difficulty,
        grade: entry.grade,
        score: entry.score,
        createdAt: entry.createdAt
      })),
      {
        userId,
        displayName,
        book,
        difficulty,
        grade,
        score,
        createdAt: now
      }
    ];
    console.log('📊 加入新記錄後總數:', allEntries.length);

    // 4. 排序（等級 > 難度 > 時間）
    allEntries.sort((a, b) => compareScores(a, b));
    console.log('📊 排序後前3名:', allEntries.slice(0, 3).map(e => ({ name: e.displayName, grade: e.grade, diff: e.difficulty })));

    // 5. 只保留前5名
    const top5 = allEntries.slice(0, 5);
    console.log('📊 TOP5:', top5.map(e => ({ rank: top5.indexOf(e) + 1, name: e.displayName, grade: e.grade })));

    // 6. 更新資料庫（使用 bulkWrite 批次更新）
    const bulkOps = top5.map((entry, index) => ({
      updateOne: {
        filter: { book, rank: index + 1 },
        update: {
          $set: {
            rank: index + 1,
            userId: entry.userId,
            displayName: entry.displayName,
            difficulty: entry.difficulty,
            grade: entry.grade,
            score: entry.score,
            createdAt: entry.createdAt
          }
        },
        upsert: true
      }
    }));

    // 7. 如果原本有超過5筆，刪除第6名以後的
    if (currentLeaderboard.length >= 5) {
      await Leaderboard.deleteMany({
        book,
        rank: { $gt: 5 }
      });
    }

    // 8. 執行批次更新
    console.log('💾 開始批次更新榜單...');
    await Leaderboard.bulkWrite(bulkOps);
    console.log('✅ 批次更新完成');

    // 9. 取得最終排名
    const finalRank = top5.findIndex(entry => entry.userId === userId) + 1;
    console.log('🏆 最終排名:', finalRank, '使用者:', displayName);

    res.json({
      success: true,
      data: {
        rank: finalRank,
        grade,
        message: `恭喜！你在${book}榜單排名第 ${finalRank} 名！`
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 取得榜單
 * GET /api/leaderboard/:book
 */
export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { book } = req.params;

    if (!book) {
      return res.status(400).json({
        success: false,
        error: 'Book parameter is required'
      });
    }

    // 取得該書籍的榜單，按排名排序
    const leaderboard = await Leaderboard.find({ book })
      .sort({ rank: 1 })
      .limit(5)
      .lean();

    // 格式化回傳資料
    const formattedLeaderboard = leaderboard.map(entry => ({
      rank: entry.rank,
      userId: entry.userId,
      displayName: entry.displayName,
      difficulty: entry.difficulty,
      grade: entry.grade,
      score: entry.score,
      createdAt: entry.createdAt
    }));

    res.json({
      success: true,
      data: formattedLeaderboard
    });

  } catch (error) {
    next(error);
  }
}

/**
 * 取得所有書籍的榜單
 * GET /api/leaderboard
 */
export async function getAllLeaderboards(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('📚 取得所有書籍榜單');
    // 定義書籍列表（不含書名號）
    const books = ['神奇西芹汁', '搶救肝臟', '改變生命的食物', '綜合'];

    // 並行取得所有書籍的榜單
    const results = await Promise.all(
      books.map(async (book) => {
        console.log(`🔍 查詢書籍: ${book}`);
        const leaderboard = await Leaderboard.find({ book })
          .sort({ rank: 1 })
          .limit(5)
          .lean();
        console.log(`📊 ${book} 榜單記錄數: ${leaderboard.length}`);

        return {
          book,
          entries: leaderboard.map(entry => ({
            rank: entry.rank,
            userId: entry.userId,
            displayName: entry.displayName,
            difficulty: entry.difficulty,
            grade: entry.grade,
            score: entry.score,
            createdAt: entry.createdAt
          }))
        };
      })
    );

    // 轉換為物件格式
    const leaderboards: Record<string, any[]> = {};
    results.forEach(result => {
      leaderboards[result.book] = result.entries;
    });

    res.json({
      success: true,
      data: leaderboards
    });

  } catch (error) {
    next(error);
  }
}
