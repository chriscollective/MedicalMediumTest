import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  type: 'single' | 'multiple' | 'fill';
  question: string;
  options?: string[];
  fillOptions?: string[];
  correctAnswer: number | number[];
  source?: string;
  explanation?: string;
  difficulty: '初階' | '進階';
  book: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['single', 'multiple', 'fill'],
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  },
  options: {
    type: [String],
    validate: {
      validator: function(this: IQuestion, v: string[]) {
        if (this.type === 'single' || this.type === 'multiple') {
          return v && v.length >= 2 && v.length <= 10;
        }
        return true;
      },
      message: '單選/多選題必須有 2-10 個選項'
    }
  },
  fillOptions: {
    type: [String],
    validate: {
      validator: function(this: IQuestion, v: string[]) {
        if (this.type === 'fill') {
          return v && v.length >= 3 && v.length <= 20;
        }
        return true;
      },
      message: '填空題必須有 3-20 個答案選項'
    }
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(this: IQuestion, v: any) {
        if (this.type === 'single' || this.type === 'fill') {
          return typeof v === 'number' && v >= 0;
        }
        if (this.type === 'multiple') {
          return Array.isArray(v) && v.length > 0 && v.every((x: any) => typeof x === 'number' && x >= 0);
        }
        return false;
      },
      message: '答案格式不正確：單選/填空需要數字 index，多選需要數字陣列'
    }
  },
  source: {
    type: String,
    maxlength: 200
  },
  explanation: {
    type: String,
    maxlength: 1000
  },
  difficulty: {
    type: String,
    enum: ['初階', '進階'],
    required: true,
    index: true
  },
  book: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// 複合索引：加速查詢
QuestionSchema.index({ book: 1, difficulty: 1, type: 1 });

export default mongoose.model<IQuestion>('Question', QuestionSchema);
