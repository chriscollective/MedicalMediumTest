export type QuestionType = 'single' | 'multiple' | 'cloze';
export type Difficulty = '初階' | '進階';

export type Question =
  | {
      _id: string;
      type: 'single';
      question: string;
      options: string[];
      correctAnswer: number;
      source?: string;
      explanation?: string;
      difficulty: Difficulty;
      book: string;
      createdBy?: string;
      updatedBy?: string;
      createdAt: string;
      updatedAt: string;
      clonedFrom?: string;
    }
  | {
      _id: string;
      type: 'multiple';
      question: string;
      options: string[];
      correctAnswer: number[];
      source?: string;
      explanation?: string;
      difficulty: Difficulty;
      book: string;
      createdBy?: string;
      updatedBy?: string;
      createdAt: string;
      updatedAt: string;
      clonedFrom?: string;
    }
  | {
      _id: string;
      type: 'cloze';
      question: string;
      options: string[];
      correctAnswer: number[];
      source?: string;
      explanation?: string;
      difficulty: Difficulty;
      book: string;
      createdBy?: string;
      updatedBy?: string;
      createdAt: string;
      updatedAt: string;
      clonedFrom?: string;
    };
