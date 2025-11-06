import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  type: "single" | "multiple" | "cloze";
  question: string;
  options?: string[];
  correctAnswer: number | number[];
  source?: string;
  explanation?: string;
  difficulty: "初階" | "進階";
  book: string;
  createdBy?: string;
  updatedBy?: string;
  history?: Array<{ updatedBy: string; updatedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
  clonedFrom?: mongoose.Types.ObjectId;
}

const QuestionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["single", "multiple", "cloze"],
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500,
    },
    options: {
      type: [String],
      validate: {
        validator: function (this: IQuestion, v: string[]) {
          if (this.type === "single" || this.type === "multiple") {
            return v && v.length >= 2 && v.length <= 10;
          }
          if (this.type === "cloze") {
            return (
              Array.isArray(v) &&
              v.length >= 1 &&
              v.length <= 6 &&
              v.every((opt) => typeof opt === "string" && opt.trim().length > 0)
            );
          }
          return true;
        },
        message: "單選/多選題必須有 2-10 個選項；克漏字題需提供 1-6 個非空選項",
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (this: IQuestion, v: any) {
          if (this.type === "single") {
            return typeof v === "number" && v >= 0;
          }
          if (this.type === "multiple") {
            return (
              Array.isArray(v) &&
              v.length > 0 &&
              v.every((x: any) => typeof x === "number" && x >= 0)
            );
          }
          if (this.type === "cloze") {
            if (!Array.isArray(v)) {
              return false;
            }
            const optionLength = Array.isArray(this.options) ? this.options.length : 0;
            if (optionLength < 1 || optionLength > 6) {
              return false;
            }
            if (v.length < 1 || v.length > optionLength) {
              return false;
            }
            const uniqueIndices = new Set(v);
            const validRange = v.every(
              (idx: any) =>
                Number.isInteger(idx) && idx >= 0 && idx < optionLength
            );
            return validRange && uniqueIndices.size === v.length;
          }
          return false;
        },
        message:
          "答案格式不正確：單選需要數字 index，多選需要數字陣列，克漏字題需提供 1~選項數量的唯一索引陣列",
      },
    },
    source: {
      type: String,
      maxlength: 200,
    },
    explanation: {
      type: String,
      maxlength: 1000,
    },
    difficulty: {
      type: String,
      enum: ["初階", "進階"],
      required: true,
      index: true,
    },
    book: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
      index: true,
    },
    updatedBy: {
      type: String,
      index: true,
    },
    history: [
      new Schema(
        {
          updatedBy: { type: String, required: true },
          updatedAt: { type: Date, required: true },
        },
        { _id: false }
      ),
    ],
    clonedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 複合索引：加速查詢
QuestionSchema.index({ book: 1, difficulty: 1, type: 1 });

export default mongoose.model<IQuestion>("Question", QuestionSchema);
