import api from './api';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  difficulty: string;
  grade: string;
  score: number;
  createdAt: string;
}

export interface CheckLeaderboardResponse {
  qualified: boolean;
  rank?: number;
  reason?: string;
  message?: string;
}

export interface SubmitLeaderboardResponse {
  rank: number;
  grade: string;
  message: string;
}

/**
 * 檢查是否上榜
 */
export async function checkLeaderboard(
  userId: string,
  book: string,
  difficulty: string,
  score: number
): Promise<CheckLeaderboardResponse> {
  const response = await api.post('/leaderboard/check', {
    userId,
    book,
    difficulty,
    score
  });
  return response.data.data;
}

/**
 * 提交榜單名稱
 */
export async function submitLeaderboard(
  userId: string,
  book: string,
  difficulty: string,
  score: number,
  displayName: string
): Promise<SubmitLeaderboardResponse> {
  const response = await api.post('/leaderboard/submit', {
    userId,
    book,
    difficulty,
    score,
    displayName
  });
  return response.data.data;
}

/**
 * 取得單一書籍榜單
 */
export async function getLeaderboardByBook(book: string): Promise<LeaderboardEntry[]> {
  const response = await api.get(`/leaderboard/${encodeURIComponent(book)}`);
  return response.data.data;
}

/**
 * 取得所有書籍榜單
 */
export async function getAllLeaderboards(): Promise<Record<string, LeaderboardEntry[]>> {
  const response = await api.get('/leaderboard');
  return response.data.data;
}
