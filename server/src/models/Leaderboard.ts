import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaderboard extends Document {
  rank: number;
  displayName: string;
  userId: string;
  book: string;
  difficulty: string;
  grade: string;
  score: number;
  createdAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>({
  rank: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    trim: true
  },
  book: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['初階', '進階']
  },
  grade: {
    type: String,
    required: true,
    enum: ['S', 'A+', 'A', 'B+', 'B', 'C+', 'F']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 建立複合索引：book + rank（確保每個書籍的每個排名只有一筆記錄）
LeaderboardSchema.index({ book: 1, rank: 1 }, { unique: true });

// 建立索引：userId + book（快速查詢某使用者在某書籍的最佳記錄）
LeaderboardSchema.index({ userId: 1, book: 1 });

export default mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);
