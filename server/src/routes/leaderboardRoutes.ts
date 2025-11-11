import express from 'express';
import {
  checkLeaderboard,
  submitLeaderboard,
  getLeaderboard,
  getAllLeaderboards
} from '../controllers/leaderboardController';
import { leaderboardLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// 檢查是否上榜（嚴格限制，防止洗榜）
router.post('/check', leaderboardLimiter, checkLeaderboard);

// 提交榜單名稱（嚴格限制，防止洗榜）
router.post('/submit', leaderboardLimiter, submitLeaderboard);

// 取得單一書籍榜單
router.get('/:book', getLeaderboard);

// 取得所有書籍榜單
router.get('/', getAllLeaderboards);

export default router;
