# Quizzes API Contract

**Base Path**: `/api/quizzes`

**Purpose**: 測驗記錄的建立、提交、查詢功能

---

## Endpoints

### 1. POST /api/quizzes

**功能**: 開始新測驗（建立測驗記錄）

**權限**: 公開

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "book": "醫療靈媒",
  "difficulty": "中等",
  "questions": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013",
    // ... 共 20 個題目 ID
  ]
}
```

**欄位說明**:

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `userId` | string | ✅ | localStorage 中的 UUID |
| `book` | string | ✅ | 測驗書籍 |
| `difficulty` | string | ✅ | 測驗難度（`簡單`, `中等`, `困難`） |
| `questions` | string[] | ✅ | 20 個題目 ID（ObjectId） |

#### Response

**Success (201 Created)**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439099",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "book": "醫療靈媒",
    "difficulty": "中等",
    "questions": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      // ... 共 20 個
    ],
    "totalScore": 0,
    "createdAt": "2025-10-30T10:00:00.000Z"
  },
  "message": "Quiz created successfully"
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Validation failed: questions array must contain exactly 20 question IDs"
}
```

**Error (400 Bad Request - Invalid UUID)**:

```json
{
  "success": false,
  "error": "Invalid userId format. Must be a valid UUID v4"
}
```

---

### 2. POST /api/quizzes/:id/submit

**功能**: 提交測驗答案並計算成績

**權限**: 公開

#### Request

**Path Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 測驗 ID（MongoDB ObjectId） |

**Headers**:
```
Content-Type: application/json
```

**Body**:

```json
{
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439011",
      "userAnswer": "排毒"
    },
    {
      "questionId": "507f1f77bcf86cd799439012",
      "userAnswer": ["螺旋藻", "香菜", "野生藍莓"]
    },
    {
      "questionId": "507f1f77bcf86cd799439013",
      "userAnswer": null  // 未作答
    },
    // ... 共 20 題
  ]
}
```

**欄位說明**:

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `answers` | array | ✅ | 作答記錄陣列（必須恰好 20 題） |
| `answers[].questionId` | string | ✅ | 題目 ID |
| `answers[].userAnswer` | string \| string[] \| null | ✅ | 使用者答案（未作答為 null） |

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "quizId": "507f1f77bcf86cd799439099",
    "totalScore": 78,
    "correctCount": 16,
    "incorrectCount": 4,
    "details": [
      {
        "_id": "507f1f77bcf86cd799439100",
        "questionId": "507f1f77bcf86cd799439011",
        "userAnswer": "排毒",
        "correctAnswer": "排毒",
        "isCorrect": true
      },
      {
        "_id": "507f1f77bcf86cd799439101",
        "questionId": "507f1f77bcf86cd799439012",
        "userAnswer": ["螺旋藻", "香菜", "野生藍莓"],
        "correctAnswer": ["螺旋藻", "大麥草汁粉", "香菜", "野生藍莓", "大西洋紅藻"],
        "isCorrect": false
      },
      // ... 共 20 題
    ]
  },
  "message": "Quiz submitted successfully"
}
```

**欄位說明**:

| 欄位 | 型別 | 說明 |
|------|------|------|
| `quizId` | string | 測驗 ID |
| `totalScore` | number | 總分（0-100） |
| `correctCount` | number | 答對題數 |
| `incorrectCount` | number | 答錯題數 |
| `details` | array | 每題的詳細作答記錄 |
| `details[]._id` | string | Answer 記錄 ID |
| `details[].questionId` | string | 題目 ID |
| `details[].userAnswer` | string \| string[] \| null | 使用者答案 |
| `details[].correctAnswer` | string \| string[] | 正確答案 |
| `details[].isCorrect` | boolean | 是否答對 |

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Validation failed: answers array must contain exactly 20 items"
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": "Quiz not found"
}
```

**Error (409 Conflict)**:

```json
{
  "success": false,
  "error": "Quiz has already been submitted"
}
```

---

### 3. GET /api/quizzes/:id

**功能**: 取得測驗記錄詳情（含作答記錄）

**權限**: 公開

#### Request

**Path Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 測驗 ID（MongoDB ObjectId） |

**Query Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `includeAnswers` | boolean | ❌ | 是否包含作答記錄（預設 false） |

**範例**:
```http
GET /api/quizzes/507f1f77bcf86cd799439099?includeAnswers=true
```

#### Response

**Success (200 OK) - 不含作答記錄**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439099",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "book": "醫療靈媒",
    "difficulty": "中等",
    "questions": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      // ... 共 20 個
    ],
    "totalScore": 78,
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
}
```

**Success (200 OK) - 包含作答記錄**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439099",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "book": "醫療靈媒",
    "difficulty": "中等",
    "questions": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      // ... 共 20 個
    ],
    "totalScore": 78,
    "createdAt": "2025-10-30T10:00:00.000Z",
    "answers": [
      {
        "_id": "507f1f77bcf86cd799439100",
        "questionId": "507f1f77bcf86cd799439011",
        "userAnswer": "排毒",
        "correctAnswer": "排毒",
        "isCorrect": true,
        "createdAt": "2025-10-30T10:05:00.000Z"
      },
      // ... 共 20 題
    ]
  }
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": "Quiz not found"
}
```

---

### 4. GET /api/quizzes

**功能**: 查詢測驗記錄列表（支援篩選）

**權限**: 公開

#### Request

**Query Parameters**:

| 參數 | 型別 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `userId` | string | ❌ | 使用者 UUID | `550e8400-e29b-41d4-a716-446655440000` |
| `book` | string | ❌ | 書籍篩選 | `醫療靈媒` |
| `difficulty` | string | ❌ | 難度篩選 | `簡單`, `中等`, `困難` |
| `limit` | number | ❌ | 回傳數量限制 | `10`（預設 20） |
| `skip` | number | ❌ | 跳過筆數（分頁） | `0`（預設 0） |
| `sort` | string | ❌ | 排序欄位 | `createdAt`（預設）, `-createdAt` |

**範例**:
```http
GET /api/quizzes?userId=550e8400-e29b-41d4-a716-446655440000&limit=10&sort=-createdAt
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439099",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "book": "醫療靈媒",
      "difficulty": "中等",
      "totalScore": 78,
      "createdAt": "2025-10-30T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439098",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "book": "醫療靈媒",
      "difficulty": "簡單",
      "totalScore": 92,
      "createdAt": "2025-10-29T14:30:00.000Z"
    }
  ],
  "count": 2,
  "total": 15
}
```

**欄位說明**:

| 欄位 | 型別 | 說明 |
|------|------|------|
| `data` | array | 測驗記錄陣列 |
| `count` | number | 回傳筆數 |
| `total` | number | 符合條件的總筆數（用於分頁） |

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Invalid userId format. Must be a valid UUID v4"
}
```

---

## Business Rules

### 測驗建立規則（FR-010, FR-011, FR-012）

1. **題目數量**：必須恰好 20 題
2. **題目順序**：
   - 1-10：單選題（`type: 'single'`）
   - 11-15：多選題（`type: 'multiple'`）
   - 16-20：填空題（`type: 'fill'`）
3. **隨機抽取**：前端呼叫 Questions API 隨機取得題目後傳入

### 計分規則（FR-007, FR-008, FR-009）

```typescript
// 伺服器端計算邏輯
function calculateScore(answers: Answer[]): number {
  let score = 0;

  answers.forEach((answer, index) => {
    if (answer.isCorrect) {
      if (index < 10) {
        score += 5;  // 單選題 5 分
      } else if (index < 15) {
        score += 6;  // 多選題 6 分
      } else {
        score += 5;  // 填空題 5 分
      }
    }
  });

  return score;  // 總分 = 10×5 + 5×6 + 5×5 = 100
}
```

### 答案驗證規則（FR-018）

```typescript
function isAnswerCorrect(
  userAnswer: string | string[] | null,
  correctAnswer: string | string[],
  questionType: QuestionType
): boolean {
  // 未作答
  if (userAnswer === null) return false;

  // 單選題和填空題
  if (questionType === 'single' || questionType === 'fill') {
    return userAnswer === correctAnswer;
  }

  // 多選題（陣列內容相同，順序不影響）
  if (questionType === 'multiple') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
  }

  return false;
}
```

### 測驗提交規則

1. **一次性提交**：測驗提交後不可修改（`totalScore` 從 0 更新為實際分數）
2. **重複提交檢查**：若 `totalScore > 0`，視為已提交，回傳 409 Conflict
3. **作答記錄建立**：提交時批次建立 20 筆 Answer 記錄
4. **原子操作**：使用 MongoDB Transaction 確保 Quiz 更新和 Answer 建立的一致性

---

## Error Codes

| HTTP Status | Error Code | 說明 |
|-------------|------------|------|
| 400 | VALIDATION_ERROR | 請求資料驗證失敗 |
| 404 | NOT_FOUND | 測驗記錄不存在 |
| 409 | ALREADY_SUBMITTED | 測驗已經提交過 |
| 500 | INTERNAL_ERROR | 伺服器內部錯誤 |

---

## Rate Limiting

- **一般查詢**: 100 requests/分鐘
- **建立測驗**: 10 requests/分鐘
- **提交測驗**: 10 requests/分鐘

---

## Examples

### 範例 1：開始測驗（前端流程）

```typescript
// src/services/quizService.ts

import axios from 'axios';
import { getUserId } from '../utils/userStorage';
import { fetchQuizQuestions } from './questionService';

export async function startQuiz(
  book: string,
  difficulty: string
): Promise<{ quizId: string; questions: Question[] }> {
  // 1. 取得使用者 ID
  const userId = getUserId();

  // 2. 隨機抽取 20 題
  const questions = await fetchQuizQuestions(book, difficulty);

  if (questions.length !== 20) {
    throw new Error('Failed to fetch exactly 20 questions');
  }

  // 3. 建立測驗記錄
  const response = await axios.post('/api/quizzes', {
    userId,
    book,
    difficulty,
    questions: questions.map(q => q._id)
  });

  return {
    quizId: response.data.data._id,
    questions
  };
}
```

### 範例 2：提交測驗

```typescript
export async function submitQuiz(
  quizId: string,
  answers: { questionId: string; userAnswer: string | string[] | null }[]
) {
  const response = await axios.post(`/api/quizzes/${quizId}/submit`, {
    answers
  });

  return response.data.data;
}
```

### 範例 3：查詢使用者測驗歷史

```typescript
export async function getUserQuizHistory(userId: string, limit = 10) {
  const response = await axios.get('/api/quizzes', {
    params: {
      userId,
      limit,
      sort: '-createdAt'
    }
  });

  return response.data.data;
}
```

---

## MongoDB Transaction Example

```typescript
// server/src/controllers/quizController.ts

import mongoose from 'mongoose';
import Quiz from '../models/Quiz';
import Answer from '../models/Answer';
import Question from '../models/Question';

export async function submitQuiz(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { answers } = req.body;

    // 1. 查詢測驗記錄
    const quiz = await Quiz.findById(id).session(session);
    if (!quiz) throw new Error('Quiz not found');
    if (quiz.totalScore > 0) throw new Error('Already submitted');

    // 2. 查詢所有題目以取得正確答案
    const questions = await Question.find({
      _id: { $in: quiz.questions }
    }).session(session);

    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    // 3. 建立作答記錄並計算分數
    const answerDocs = [];
    let totalScore = 0;

    for (let i = 0; i < answers.length; i++) {
      const { questionId, userAnswer } = answers[i];
      const question = questionMap.get(questionId);

      if (!question) throw new Error(`Question ${questionId} not found`);

      const isCorrect = isAnswerCorrect(
        userAnswer,
        question.correctAnswer,
        question.type
      );

      answerDocs.push({
        quizId: quiz._id,
        questionId: question._id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      });

      // 計算得分
      if (isCorrect) {
        if (i < 10) totalScore += 5;       // 單選
        else if (i < 15) totalScore += 6;  // 多選
        else totalScore += 5;              // 填空
      }
    }

    // 4. 批次建立 Answer 記錄
    const createdAnswers = await Answer.insertMany(answerDocs, { session });

    // 5. 更新 Quiz 的 totalScore
    quiz.totalScore = totalScore;
    await quiz.save({ session });

    // 6. 提交 Transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        totalScore,
        correctCount: answerDocs.filter(a => a.isCorrect).length,
        incorrectCount: answerDocs.filter(a => !a.isCorrect).length,
        details: createdAnswers
      },
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```
