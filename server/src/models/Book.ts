import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    name: {
      type: String,
      required: [true, '書籍名稱為必填'],
      unique: true,
      trim: true,
      minlength: [1, '書籍名稱不能為空'],
      maxlength: [100, '書籍名稱不能超過 100 字元']
    }
  },
  {
    timestamps: true
  }
);

// 注意：name 欄位的 unique: true 已經自動建立了唯一索引，無需重複定義

const Book = mongoose.model<IBook>('Book', bookSchema);

export default Book;
