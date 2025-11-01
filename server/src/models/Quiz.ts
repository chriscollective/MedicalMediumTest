import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  userId: string;
  book: string;
  difficulty: '初階' | '進階';
  questions: mongoose.Types.ObjectId[];
  answerBitmap: string;
  correctCount: number;
  totalScore: number;
  createdAt: Date;
}

const QuizSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    validate: {
      validator: (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
      message: 'userId 必須是有效的 UUID 格式'
    }
  },
  book: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['初階', '進階'],
    required: true,
    index: true
  },
  questions: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    required: true,
    validate: {
      validator: (v: any[]) => v.length === 20,
      message: '每次測驗必須有 20 題'
    }
  },
  answerBitmap: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^[01]{20}$/.test(v),
      message: 'answerBitmap 必須是 20 個 0 或 1 的字串'
    },
    default: '00000000000000000000'
  },
  correctCount: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
    default: 0
  },
  totalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// 複合索引：用於分析查詢
QuizSchema.index({ userId: 1, createdAt: -1 });
QuizSchema.index({ book: 1, difficulty: 1, createdAt: -1 });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
