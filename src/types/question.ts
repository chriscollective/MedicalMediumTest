export type QuestionType = 'single' | 'multiple' | 'fill' | 'cloze';
export type Difficulty = '初階' | '進階';

export type Question =
  | {
      _id: string;
      type: 'single';
      question: string;
      options: string[];
      fillOptions?: string[];
      correctAnswer: number;
      source?: string;
      explanation?: string;
      difficulty: Difficulty;
      book: string;
      createdBy?: string;
      updatedBy?: string;
      createdAt: string;
      updatedAt: string;
    }
  | {
      _id: string;
      type: 'multiple';
      question: string;
      options: string[];
      fillOptions?: string[];
      correctAnswer: number[];
      source?: string;
      explanation?: string;
      difficulty: Difficulty;
      book: string;
      createdBy?: string;
      updatedBy?: string;
      createdAt: string;
      updatedAt: string;
    }
  | {
      _id: string;
      type: 'fill';
      question: string;
      options?: string[];
      fillOptions: string[];
      correctAnswer: number;
      source?: string;
      explanation?: string;
      difficulty: Difficulty;
      book: string;
      createdBy?: string;
      updatedBy?: string;
      createdAt: string;
      updatedAt: string;
    }
  | {
      _id: string;
      type: 'cloze';
      question: string;
      options: string[];
      fillOptions?: string[];
      correctAnswer: number[];
      source?: string;
      explanation?: string;
      difficulty: Difficulty;
      book: string;
      createdBy?: string;
      updatedBy?: string;
      createdAt: string;
      updatedAt: string;
    };
