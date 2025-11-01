import api from './api';

export interface QuestionStats {
  questionId: string;
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  correctRate: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalQuizzes: number;
  difficultyDistribution: {
    beginner: number;
    advanced: number;
    beginnerPercentage: number;
  };
  avgCorrectRate: number;
  avgGrade: string;
  mostPopularBook: {
    book: string;
    count: number;
  } | null;
}

export interface GradeDistribution {
  name: string;
  value: number;
}

export interface BookDistribution {
  name: string;
  value: number;
}

export interface WrongQuestion {
  questionId: string;
  question: string;
  book: string;
  totalAnswers: number;
  correctAnswers: number;
  correctRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  book: string;
  difficulty: string;
  score: number;
  correctCount: number;
  grade: string;
  createdAt: string;
}

/**
 * 取得統計摘要
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await api.get('/analytics/summary');
  return response.data.data;
}

/**
 * 取得單一題目的統計資料
 */
export async function getQuestionStats(questionId: string): Promise<QuestionStats> {
  const response = await api.get(`/analytics/questions/${questionId}/stats`);
  return response.data.data;
}

/**
 * 批次取得多個題目的統計資料
 */
export async function getQuestionsStats(questionIds: string[]): Promise<QuestionStats[]> {
  const response = await api.post('/analytics/questions/stats', { questionIds });
  return response.data.data;
}

/**
 * 取得等級分布統計
 */
export async function getGradeDistribution(): Promise<GradeDistribution[]> {
  const response = await api.get('/analytics/grade-distribution');
  return response.data.data;
}

/**
 * 取得書籍參與比例統計
 */
export async function getBookDistribution(): Promise<BookDistribution[]> {
  const response = await api.get('/analytics/book-distribution');
  return response.data.data;
}

/**
 * 取得錯題排行榜
 */
export async function getWrongQuestions(limit: number = 10): Promise<WrongQuestion[]> {
  const response = await api.get(`/analytics/wrong-questions?limit=${limit}`);
  return response.data.data;
}

/**
 * 取得高分排行榜
 */
export async function getLeaderboard(book: string, limit: number = 10): Promise<LeaderboardEntry[]> {
  const response = await api.get(`/analytics/leaderboard?book=${encodeURIComponent(book)}&limit=${limit}`);
  return response.data.data;
}
