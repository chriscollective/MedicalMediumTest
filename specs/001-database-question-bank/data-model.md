# Data Model: 資料庫題庫系統與分析功能

**Feature**: 001-database-question-bank | **Date**: 2025-10-30

## Overview

本文件定義資料庫的 Mongoose Schema 設計，包含 4 個主要資料模型：Question（題目）、Quiz（測驗）、Answer（作答記錄）、以及隱式的 User（使用者識別）。

## Entity Relationship Diagram

```
User (localStorage UUID)
  │
  ├─── 1:N ──→ Quiz (測驗記錄)
  │              │
  │              └─── 1:N ──→ Answer (作答記錄)
  │                             │
  └────────────────────────────→ Question (題目)
```

## 1. Question Model (題目)

### Schema Definition

```typescript
// server/src/models/Question.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  type: 'single' | 'multiple' | 'fill';
  question: string;
  options?: string[];           // 單選/多選的選項
  fillOptions?: string[];       // 填空題的答案選項
  correctAnswer: string | string[];
  source?: string;
  explanation?: string;
  difficulty: '簡單' | '中等' | '困難';
  book: string;                 // 書籍來源
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
        // 單選/多選題必須有選項
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
        // 填空題必須有答案選項
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
          return typeof v === 'string' && v.length > 0;
        }
        if (this.type === 'multiple') {
          return Array.isArray(v) && v.length > 0;
        }
        return false;
      },
      message: '答案格式不正確'
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
    enum: ['簡單', '中等', '困難'],
    required: true,
    index: true
  },
  book: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true  // 自動生成 createdAt 和 updatedAt
});

// 複合索引：加速查詢
QuestionSchema.index({ book: 1, difficulty: 1, type: 1 });

export default mongoose.model<IQuestion>('Question', QuestionSchema);
```

### Field Descriptions

| 欄位 | 型別 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|---------|
| `type` | String | ✅ | 題目類型 | `single`, `multiple`, `fill` |
| `question` | String | ✅ | 題目文字 | 5-500 字元 |
| `options` | String[] | ⚠️ | 單選/多選的選項 | 單選/多選題必須有 2-10 個選項 |
| `fillOptions` | String[] | ⚠️ | 填空題的答案選項 | 填空題必須有 3-20 個選項 |
| `correctAnswer` | String \| String[] | ✅ | 正確答案 | 單選/填空為 String，多選為 String[] |
| `source` | String | ❌ | 題目出處 | 最多 200 字元 |
| `explanation` | String | ❌ | 答案解析 | 最多 1000 字元 |
| `difficulty` | String | ✅ | 難度 | `簡單`, `中等`, `困難` |
| `book` | String | ✅ | 書籍來源 | - |
| `createdAt` | Date | 🤖 | 建立時間 | Mongoose 自動生成 |
| `updatedAt` | Date | 🤖 | 更新時間 | Mongoose 自動生成 |

### Business Rules

1. **題目類型驗證**：
   - `single`：必須有 `options`，`correctAnswer` 為單一字串
   - `multiple`：必須有 `options`，`correctAnswer` 為字串陣列
   - `fill`：必須有 `fillOptions`，`correctAnswer` 為單一字串

2. **索引策略**：
   - 單欄位索引：`type`, `difficulty`, `book`（加速篩選查詢）
   - 複合索引：`{ book: 1, difficulty: 1, type: 1 }`（加速組合查詢）

3. **資料完整性**：
   - 所有題目必須指定書籍來源和難度
   - 選項和答案必須符合題目類型的驗證規則

---

## 2. Quiz Model (測驗記錄)

### Schema Definition

```typescript
// server/src/models/Quiz.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  userId: string;               // localStorage UUID
  book: string;
  difficulty: '簡單' | '中等' | '困難';
  questions: mongoose.Types.ObjectId[];  // 參照 Question._id
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
    enum: ['簡單', '中等', '困難'],
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
  totalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
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
```

### Field Descriptions

| 欄位 | 型別 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|---------|
| `userId` | String | ✅ | 使用者識別（UUID） | 必須是有效的 UUID v4 格式 |
| `book` | String | ✅ | 測驗書籍 | - |
| `difficulty` | String | ✅ | 測驗難度 | `簡單`, `中等`, `困難` |
| `questions` | ObjectId[] | ✅ | 題目 ID 陣列 | 必須恰好 20 題 |
| `totalScore` | Number | ✅ | 測驗總分 | 0-100 |
| `createdAt` | Date | 🤖 | 測驗時間 | 自動生成 |

### Business Rules

1. **測驗固定規則**（FR-010, FR-011）：
   - 每次測驗必須恰好 20 題
   - 題目順序：1-10 單選、11-15 多選、16-20 填空
   - 只儲存題目 ID（`ObjectId` 參照），不複製題目內容

2. **使用者識別**（FR-016）：
   - `userId` 為 localStorage 中的 UUID
   - UUID 格式驗證：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

3. **計分規則**（FR-007, FR-008, FR-009）：
   - 單選題：5 分/題
   - 多選題：6 分/題
   - 填空題：5 分/題
   - 總分 = 單選(10題×5分) + 多選(5題×6分) + 填空(5題×5分) = 100 分

4. **索引策略**：
   - `userId` + `createdAt`：查詢使用者測驗歷史
   - `book` + `difficulty` + `createdAt`：分析特定書籍/難度的統計

---

## 3. Answer Model (作答記錄)

### Schema Definition

```typescript
// server/src/models/Answer.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  quizId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  userAnswer: string | string[] | null;
  correctAnswer: string | string[];
  isCorrect: boolean;
  createdAt: Date;
}

const AnswerSchema: Schema = new Schema({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  },
  userAnswer: {
    type: Schema.Types.Mixed,
    default: null  // 使用者未作答時為 null
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// 複合索引：統計分析用
AnswerSchema.index({ questionId: 1, isCorrect: 1 });  // 題目正確率
AnswerSchema.index({ quizId: 1, isCorrect: 1 });      // 測驗成績

export default mongoose.model<IAnswer>('Answer', AnswerSchema);
```

### Field Descriptions

| 欄位 | 型別 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|---------|
| `quizId` | ObjectId | ✅ | 所屬測驗 | 參照 `Quiz._id` |
| `questionId` | ObjectId | ✅ | 題目 ID | 參照 `Question._id` |
| `userAnswer` | Mixed | ❌ | 使用者答案 | 可為 String, String[], 或 null |
| `correctAnswer` | Mixed | ✅ | 正確答案 | String 或 String[] |
| `isCorrect` | Boolean | ✅ | 是否正確 | true/false |
| `createdAt` | Date | 🤖 | 作答時間 | 自動生成 |

### Business Rules

1. **作答記錄儲存**（FR-016, FR-017）：
   - 每一題的作答都會產生一筆 Answer 記錄
   - 未作答時 `userAnswer` 為 `null`
   - 即使題目被刪除，作答記錄仍保留

2. **答案格式**：
   - 單選題：`userAnswer` 和 `correctAnswer` 為字串
   - 多選題：為字串陣列，順序不影響正確性
   - 填空題：為字串

3. **正確性判斷**（FR-018）：
   - 單選/填空：`userAnswer === correctAnswer`
   - 多選：陣列內容相同（不考慮順序）
   - 未作答：`isCorrect = false`

4. **統計查詢優化**（SC-005, SC-007）：
   - 索引 `{ questionId: 1, isCorrect: 1 }`：快速計算題目正確率
   - 索引 `{ quizId: 1, isCorrect: 1 }`：快速計算測驗成績

---

## 4. User Model (隱式模型)

### 說明

根據 FR-015 和 FR-016，使用者識別採用 **localStorage + UUID** 方案，**不建立獨立的 User collection**。

### 實作方式

```typescript
// src/utils/userStorage.ts (前端)

import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'mmquiz_user_id';

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}
```

### 資料關聯

- Quiz 和 Answer 透過 `userId` (String) 欄位關聯使用者
- 後端不驗證 userId 是否存在，視為匿名識別碼
- 統計分析時透過 `userId` 分組計算

---

## Data Relationships

### 1:N Relationships

```
User (UUID)
  └─→ Quiz (1:N)
        └─→ Answer (1:20，每次測驗固定 20 題)

Question
  └─→ Answer (1:N，一題可能被多次作答)
```

### Reference Strategy

| 關聯 | 策略 | 說明 |
|------|------|------|
| Quiz → Question | **參照（ObjectId）** | 只儲存 ID，不複製題目內容 |
| Answer → Quiz | **參照（ObjectId）** | 關聯到測驗記錄 |
| Answer → Question | **參照（ObjectId）** | 關聯到題目 |
| Quiz → User | **字串（userId）** | 不建立 User collection |

### Deleted Question Handling

根據 Clarification Session 決策（FR-019）：

```typescript
// 前端顯示邏輯
async function loadQuizReview(quizId: string) {
  const answers = await getAnswers(quizId);

  for (const answer of answers) {
    const question = await getQuestion(answer.questionId);

    if (!question) {
      // 題目已被刪除
      displayDeletedQuestion(answer.questionId);
    } else {
      displayQuestion(question, answer);
    }
  }
}
```

---

## Validation Rules Summary

### Question Validation
- ✅ 題目類型必須為 `single`, `multiple`, `fill` 之一
- ✅ 選項數量：單選/多選 2-10 個，填空 3-20 個
- ✅ 答案格式必須符合題目類型
- ✅ 書籍和難度為必填

### Quiz Validation
- ✅ userId 必須是有效的 UUID v4 格式
- ✅ questions 陣列必須恰好 20 個 ObjectId
- ✅ totalScore 必須在 0-100 之間

### Answer Validation
- ✅ quizId 和 questionId 必須存在
- ✅ isCorrect 必須為布林值
- ✅ userAnswer 可為 null（未作答）

---

## Performance Considerations

### 索引設計目標

1. **題目抽取查詢**（FR-012）：
   - `{ book: 1, difficulty: 1, type: 1 }` 複合索引
   - 支援查詢如：`db.questions.find({ book: "XX書", difficulty: "中等", type: "single" })`

2. **使用者測驗歷史**（FR-020）：
   - `{ userId: 1, createdAt: -1 }` 複合索引
   - 快速查詢特定使用者的測驗記錄，依時間排序

3. **題目正確率統計**（FR-023）：
   - `{ questionId: 1, isCorrect: 1 }` 複合索引
   - 快速計算：`db.answers.aggregate([{ $match: { questionId: X } }, { $group: { _id: "$isCorrect", count: { $sum: 1 } } }])`

4. **得分分布統計**（FR-026）：
   - `totalScore` 欄位索引
   - 支援範圍查詢和分組統計

### 查詢效能目標（SC-001, SC-005, SC-007）

- 題目載入：< 2 秒
- 題目正確率查詢：< 3 秒
- 得分分布查詢：< 3 秒

### 資料量估算

- 題庫：~1000 題（< 1 MB）
- 測驗記錄：~10,000 筆（< 5 MB）
- 作答記錄：~200,000 筆（< 50 MB）
- **總計**：< 60 MB（符合 MongoDB Atlas 512MB 免費額度）

---

## Migration Strategy

### 初始資料遷移

1. **現有硬編碼題目**：
   - 從 `src/` 中的 TypeScript 檔案提取現有題目
   - 轉換為 JSON 格式
   - 使用 MongoDB Compass 或 Mongoose 腳本匯入

2. **遷移腳本範例**：

```typescript
// server/src/scripts/migrate-questions.ts

import mongoose from 'mongoose';
import Question from '../models/Question';
import { existingQuestions } from './existing-questions'; // 匯出現有題目

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI!);

  for (const q of existingQuestions) {
    await Question.create({
      type: q.type,
      question: q.question,
      options: q.options,
      fillOptions: q.fillOptions,
      correctAnswer: q.correctAnswer,
      source: q.source,
      explanation: q.explanation,
      difficulty: q.difficulty || '中等',  // 預設值
      book: q.book || '醫療靈媒'            // 預設值
    });
  }

  console.log(`✅ 已匯入 ${existingQuestions.length} 題`);
  await mongoose.disconnect();
}

migrate();
```

---

## Schema Evolution Plan

### 未來可能的擴展

1. **Question Model**：
   - 新增 `tags: string[]`（標籤分類）
   - 新增 `imageUrl: string`（題目圖片）
   - 新增 `usageCount: number`（使用次數）

2. **Quiz Model**：
   - 新增 `duration: number`（作答時長，秒）
   - 新增 `completedAt: Date`（完成時間）

3. **Answer Model**：
   - 新增 `timeSpent: number`（作答時間，秒）

4. **User Collection**（若未來需要）：
   - `_id: string`（UUID）
   - `nickname: string`（暱稱）
   - `firstQuizDate: Date`
   - `totalQuizzes: number`

### 版本管理

- 使用 Mongoose Schema 的 `schemaOptions.versionKey` 追蹤文件版本
- 使用 Migration 腳本處理 Schema 變更
- 保持向後相容性（新增欄位使用 `default` 值）

---

## Shared Types (前後端共用)

為確保前後端型別一致，建議在專案根目錄建立共用型別：

```typescript
// src/types/question.ts

export type QuestionType = 'single' | 'multiple' | 'fill';
export type Difficulty = '簡單' | '中等' | '困難';

export interface Question {
  _id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  fillOptions?: string[];
  correctAnswer: string | string[];
  source?: string;
  explanation?: string;
  difficulty: Difficulty;
  book: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  _id: string;
  userId: string;
  book: string;
  difficulty: Difficulty;
  questions: string[];  // Question IDs
  totalScore: number;
  createdAt: string;
}

export interface Answer {
  _id: string;
  quizId: string;
  questionId: string;
  userAnswer: string | string[] | null;
  correctAnswer: string | string[];
  isCorrect: boolean;
  createdAt: string;
}
```

後端 Mongoose 介面可繼承這些型別，確保一致性。
