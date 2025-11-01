import api from './api';
import { Question } from '../types/question';

export async function fetchQuestions(params?: {
  book?: string;
  difficulty?: string;
  type?: string;
  limit?: number;
  random?: boolean;
}): Promise<Question[]> {
  const response = await api.get('/questions', { params });
  return response.data.data;
}

export async function fetchQuizQuestions(
  book: string,
  difficulty: string
): Promise<Question[]> {
  // 使用書籍和難度篩選（已透過 constants/books.ts 的映射解決編碼問題）
  const [singles, multiples, fills] = await Promise.all([
    fetchQuestions({ book, difficulty, type: 'single', limit: 10, random: true }),
    fetchQuestions({ book, difficulty, type: 'multiple', limit: 5, random: true }),
    fetchQuestions({ book, difficulty, type: 'fill', limit: 5, random: true })
  ]);

  return [...singles, ...multiples, ...fills];
}

// 從多本書中混合抽取題目
export async function fetchMixedQuizQuestions(
  books: string[],
  difficulty: string
): Promise<Question[]> {
  // 固定題型數量：單選 10 題、多選 5 題、填空 5 題
  const targetCounts = {
    single: 10,
    multiple: 5,
    fill: 5
  };

  // 計算每本書每種題型應該抽取的數量
  const singlePerBook = Math.floor(targetCounts.single / books.length);
  const multiplePerBook = Math.floor(targetCounts.multiple / books.length);
  const fillPerBook = Math.floor(targetCounts.fill / books.length);

  const singleRemainder = targetCounts.single % books.length;
  const multipleRemainder = targetCounts.multiple % books.length;
  const fillRemainder = targetCounts.fill % books.length;

  // 分別收集各種題型
  const allSingles: Question[] = [];
  const allMultiples: Question[] = [];
  const allFills: Question[] = [];

  // 從每本書抽取題目
  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    // 計算這本書每種題型的數量（平均分配 + 餘數）
    const singleCount = singlePerBook + (i < singleRemainder ? 1 : 0);
    const multipleCount = multiplePerBook + (i < multipleRemainder ? 1 : 0);
    const fillCount = fillPerBook + (i < fillRemainder ? 1 : 0);

    const [singles, multiples, fills] = await Promise.all([
      fetchQuestions({ book, difficulty, type: 'single', limit: singleCount, random: true }),
      fetchQuestions({ book, difficulty, type: 'multiple', limit: multipleCount, random: true }),
      fetchQuestions({ book, difficulty, type: 'fill', limit: fillCount, random: true })
    ]);

    allSingles.push(...singles);
    allMultiples.push(...multiples);
    allFills.push(...fills);
  }

  // 分別打亂各種題型（在同一題型內隨機）
  const shuffledSingles = allSingles.sort(() => Math.random() - 0.5).slice(0, targetCounts.single);
  const shuffledMultiples = allMultiples.sort(() => Math.random() - 0.5).slice(0, targetCounts.multiple);
  const shuffledFills = allFills.sort(() => Math.random() - 0.5).slice(0, targetCounts.fill);

  // 按照固定順序組合：前 10 題單選、中 5 題多選、後 5 題填空
  return [...shuffledSingles, ...shuffledMultiples, ...shuffledFills];
}

export async function createQuestion(data: {
  type: 'single' | 'multiple' | 'fill';
  question: string;
  options?: string[];
  fillOptions?: string[];
  correctAnswer: number | number[];
  source?: string;
  explanation?: string;
  difficulty: string;
  book: string;
}): Promise<Question> {
  const response = await api.post('/questions', data);
  return response.data.data;
}

export async function updateQuestion(id: string, data: {
  type?: 'single' | 'multiple' | 'fill';
  question?: string;
  options?: string[];
  fillOptions?: string[];
  correctAnswer?: number | number[];
  source?: string;
  explanation?: string;
  difficulty?: string;
  book?: string;
}): Promise<Question> {
  const response = await api.put(`/questions/${id}`, data);
  return response.data.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await api.delete(`/questions/${id}`);
}
