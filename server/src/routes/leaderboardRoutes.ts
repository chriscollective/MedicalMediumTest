import express from 'express';
import {
  checkLeaderboard,
  submitLeaderboard,
  getLeaderboard,
  getAllLeaderboards
} from '../controllers/leaderboardController';

const router = express.Router();

// 檢查是否上榜
router.post('/check', checkLeaderboard);

// 提交榜單名稱
router.post('/submit', submitLeaderboard);

// 取得單一書籍榜單
router.get('/:book', getLeaderboard);

// 取得所有書籍榜單
router.get('/', getAllLeaderboards);

export default router;
