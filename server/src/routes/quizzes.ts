import { Router } from 'express';
import {
  createQuiz,
  submitQuiz,
  getQuiz,
  getQuizzes
} from '../controllers/quizController';
import { quizLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/quizzes - 建立新測驗（限制次數，防止濫用）
router.post('/', quizLimiter, createQuiz);

// POST /api/quizzes/:quizId/submit - 提交測驗答案（限制次數）
router.post('/:quizId/submit', quizLimiter, submitQuiz);

// GET /api/quizzes/:quizId - 取得測驗詳情
router.get('/:quizId', getQuiz);

// GET /api/quizzes - 查詢測驗列表
router.get('/', getQuizzes);

export default router;
