import api from './api';
import { Quiz, Answer } from '../types/quiz';

interface CreateQuizPayload {
  userId: string;
  book: string;
  difficulty: string;
  questionIds: string[];
}

interface SubmitQuizPayload {
  answers: {
    questionId: string;
    userAnswer: number | number[] | null;
  }[];
}

interface SubmitQuizResponse {
  quizId: string;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  answers: Answer[];
}

// 建立新測驗
export async function createQuiz(payload: CreateQuizPayload): Promise<Quiz> {
  const response = await api.post('/quizzes', payload);
  return response.data.data;
}

// 提交測驗答案
export async function submitQuiz(
  quizId: string,
  payload: SubmitQuizPayload
): Promise<SubmitQuizResponse> {
  const response = await api.post(`/quizzes/${quizId}/submit`, payload);
  return response.data.data;
}

// 取得測驗詳情
export async function getQuiz(quizId: string): Promise<{
  quiz: Quiz;
  answers: Answer[];
}> {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data.data;
}

// 查詢測驗列表
export async function getQuizzes(params?: {
  userId?: string;
  book?: string;
  difficulty?: string;
  limit?: number;
  skip?: number;
}): Promise<{
  data: Quiz[];
  count: number;
  total: number;
}> {
  const response = await api.get('/quizzes', { params });
  return {
    data: response.data.data,
    count: response.data.count,
    total: response.data.total
  };
}
