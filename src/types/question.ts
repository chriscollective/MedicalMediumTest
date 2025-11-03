export type QuestionType = 'single' | 'multiple' | 'fill';
export type Difficulty = '初階' | '進階';

export interface Question {
  _id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  fillOptions?: string[];
  correctAnswer: number | number[];
  source?: string;
  explanation?: string;
  difficulty: Difficulty;
  book: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
