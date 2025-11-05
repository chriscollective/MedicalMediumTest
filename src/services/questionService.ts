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

const DEFAULT_QUIZ_COUNTS = {
  single: 8,
  multiple: 4,
  fill: 4,
  cloze: 4
} as const;

export async function fetchQuizQuestions(
  book: string,
  difficulty: string
): Promise<Question[]> {
  const { single, multiple, fill, cloze } = DEFAULT_QUIZ_COUNTS;

  const [singles, multiples, fills, clozes] = await Promise.all([
    fetchQuestions({ book, difficulty, type: 'single', limit: single, random: true }),
    fetchQuestions({ book, difficulty, type: 'multiple', limit: multiple, random: true }),
    fetchQuestions({ book, difficulty, type: 'fill', limit: fill, random: true }),
    fetchQuestions({ book, difficulty, type: 'cloze', limit: cloze, random: true })
  ]);

  const questions = [...singles, ...multiples, ...fills, ...clozes];

  if (questions.length < 20) {
    console.warn('[Quiz] 題庫不足：', {
      book,
      difficulty,
      requested: 20,
      received: questions.length
    });
  }

  return questions.slice(0, 20);
}

// 從多本書中混合抽取題目
export async function fetchMixedQuizQuestions(
  books: string[],
  difficulty: string
): Promise<Question[]> {
  // 固定題型數量：單選 8、多選 4、填空 4、克漏字 4
  const targetCounts = {
    single: 8,
    multiple: 4,
    fill: 4,
    cloze: 4
  };

  // 計算每本書每種題型應該抽取的數量
  const singlePerBook = Math.floor(targetCounts.single / books.length);
  const multiplePerBook = Math.floor(targetCounts.multiple / books.length);
  const fillPerBook = Math.floor(targetCounts.fill / books.length);
  const clozePerBook = Math.floor(targetCounts.cloze / books.length);

  const singleRemainder = targetCounts.single % books.length;
  const multipleRemainder = targetCounts.multiple % books.length;
  const fillRemainder = targetCounts.fill % books.length;
  const clozeRemainder = targetCounts.cloze % books.length;

  // 分別收集各種題型
  const allSingles: Question[] = [];
  const allMultiples: Question[] = [];
  const allFills: Question[] = [];
  const allClozes: Question[] = [];

  // 從每本書抽取題目
  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    // 計算這本書每種題型的數量（平均分配 + 餘數）
    const singleCount = singlePerBook + (i < singleRemainder ? 1 : 0);
    const multipleCount = multiplePerBook + (i < multipleRemainder ? 1 : 0);
    const fillCount = fillPerBook + (i < fillRemainder ? 1 : 0);
    const clozeCount = clozePerBook + (i < clozeRemainder ? 1 : 0);

    const [singles, multiples, fills, clozes] = await Promise.all([
      fetchQuestions({ book, difficulty, type: 'single', limit: singleCount, random: true }),
      fetchQuestions({ book, difficulty, type: 'multiple', limit: multipleCount, random: true }),
      fetchQuestions({ book, difficulty, type: 'fill', limit: fillCount, random: true }),
      fetchQuestions({ book, difficulty, type: 'cloze', limit: clozeCount, random: true })
    ]);

    allSingles.push(...singles);
    allMultiples.push(...multiples);
    allFills.push(...fills);
    allClozes.push(...clozes);
  }

  // 分別打亂各種題型（在同一題型內隨機）
  const shuffledSingles = allSingles.sort(() => Math.random() - 0.5).slice(0, targetCounts.single);
  const shuffledMultiples = allMultiples.sort(() => Math.random() - 0.5).slice(0, targetCounts.multiple);
  const shuffledFills = allFills.sort(() => Math.random() - 0.5).slice(0, targetCounts.fill);
  const shuffledClozes = allClozes.sort(() => Math.random() - 0.5).slice(0, targetCounts.cloze);

  const questions = [
    ...shuffledSingles,
    ...shuffledMultiples,
    ...shuffledFills,
    ...shuffledClozes
  ];

  if (questions.length < 20) {
    console.warn('[Quiz] 混合抽題不足：', {
      books,
      difficulty,
      requested: 20,
      received: questions.length
    });
  }

  return questions.slice(0, 20);
}

export async function createQuestion(data: {
  type: 'single' | 'multiple' | 'fill' | 'cloze';
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
  type?: 'single' | 'multiple' | 'fill' | 'cloze';
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
