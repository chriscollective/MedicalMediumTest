import express from 'express';
import {
  getQuestionStats,
  getQuestionsStats,
  getAnalyticsSummary,
  getGradeDistribution,
  getBookDistribution,
  getWrongQuestions,
  getLeaderboard
} from '../controllers/analyticsController';

const router = express.Router();

/**
 * @route   GET /api/analytics/summary
 * @desc    取得統計摘要（累積測驗人數、平均等級、平均正確率、最熱門書籍）
 * @access  Public
 */
router.get('/summary', getAnalyticsSummary);

/**
 * @route   GET /api/analytics/grade-distribution
 * @desc    取得等級分布統計
 * @access  Public
 */
router.get('/grade-distribution', getGradeDistribution);

/**
 * @route   GET /api/analytics/book-distribution
 * @desc    取得書籍參與比例統計
 * @access  Public
 */
router.get('/book-distribution', getBookDistribution);

/**
 * @route   GET /api/analytics/wrong-questions
 * @desc    取得錯題排行榜（正確率最低的題目）
 * @query   limit - 回傳數量限制（預設 10）
 * @access  Public
 */
router.get('/wrong-questions', getWrongQuestions);

/**
 * @route   GET /api/analytics/leaderboard
 * @desc    取得高分排行榜
 * @query   book - 書籍名稱（神奇西芹汁/搶救肝臟/改變生命的食物/綜合）
 * @query   limit - 回傳數量限制（預設 10）
 * @access  Public
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @route   GET /api/analytics/questions/:questionId/stats
 * @desc    取得單一題目的統計資料（總作答數、正確數、正確率）
 * @access  Public
 */
router.get('/questions/:questionId/stats', getQuestionStats);

/**
 * @route   POST /api/analytics/questions/stats
 * @desc    批次取得多個題目的統計資料
 * @body    { questionIds: string[] }
 * @access  Public
 */
router.post('/questions/stats', getQuestionsStats);

export default router;

