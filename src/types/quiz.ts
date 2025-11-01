import { Difficulty } from './question';

export interface Quiz {
  _id: string;
  userId: string;
  book: string;
  difficulty: Difficulty;
  questions: string[];
  totalScore: number;
  createdAt: string;
}

export interface Answer {
  _id: string;
  quizId: string;
  questionId: string;
  userAnswer: number | number[] | null;
  correctAnswer: number | number[];
  isCorrect: boolean;
  createdAt: string;
}
