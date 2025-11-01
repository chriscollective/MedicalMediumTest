import { Router } from 'express';
import {
  createQuiz,
  submitQuiz,
  getQuiz,
  getQuizzes
} from '../controllers/quizController';

const router = Router();

// POST /api/quizzes - 建立新測驗
router.post('/', createQuiz);

// POST /api/quizzes/:quizId/submit - 提交測驗答案
router.post('/:quizId/submit', submitQuiz);

// GET /api/quizzes/:quizId - 取得測驗詳情
router.get('/:quizId', getQuiz);

// GET /api/quizzes - 查詢測驗列表
router.get('/', getQuizzes);

export default router;
