import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  bookName: string;
  questionType: string;
  questionContent: string;
  issueDescription: string;
  status: "pending" | "in_progress" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

const ReportSchema: Schema = new Schema(
  {
    bookName: {
      type: String,
      required: true,
      maxlength: 100,
      index: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: ["單選題", "多選題", "克漏字題"],
      index: true,
    },
    questionContent: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    issueDescription: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
      maxlength: 100,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// 索引：方便查詢
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ bookName: 1, status: 1 });

export default mongoose.model<IReport>("Report", ReportSchema);
