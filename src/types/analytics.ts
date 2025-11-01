export interface QuestionStats {
  questionId: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  correctRate: number | null;
}

export interface ScoreDistribution {
  totalQuizzes: number;
  averageScore: number;
  medianScore: number;
  distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export interface AnalyticsSummary {
  totalQuestions: number;
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  questionsByDifficulty: Record<string, number>;
  questionsByType: Record<string, number>;
  quizzesByDifficulty: Record<string, number>;
}
