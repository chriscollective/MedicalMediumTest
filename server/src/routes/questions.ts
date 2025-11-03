import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController';

const router = express.Router();

router.get('/', getQuestions);
router.get('/:id', getQuestion);
// 將管理員資訊帶入建立/更新者欄位
const withActor = (req: AuthRequest, _res: express.Response, next: express.NextFunction) => {
  if (req.admin) {
    if (req.method === 'POST') {
      (req.body as any).createdBy = req.admin.username;
      (req.body as any).updatedBy = req.admin.username;
    }
    if (req.method === 'PUT') {
      (req.body as any).updatedBy = req.admin.username;
    }
  }
  next();
};

router.post('/', authenticate as any, withActor, createQuestion);
router.put('/:id', authenticate as any, withActor, updateQuestion);
router.delete('/:id', authenticate as any, deleteQuestion);

export default router;
