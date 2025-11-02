# Quickstart Guide: 資料庫題庫系統開發指南

**Feature**: 001-database-question-bank | **Date**: 2025-10-30

## 目錄

1. [開發環境設置](#開發環境設置)
2. [MongoDB Atlas 配置](#mongodb-atlas-配置)
3. [專案結構說明](#專案結構說明)
4. [開發工作流程](#開發工作流程)
5. [API 開發指南](#api-開發指南)
6. [前端整合指南](#前端整合指南)
7. [測試與除錯](#測試與除錯)
8. [常見問題](#常見問題)

---

## 開發環境設置

### 1. 前置需求

確保已安裝以下工具：

```bash
node -v    # Node.js 18+
npm -v     # npm 9+
git --version
```

### 2. 安裝依賴

在專案根目錄執行：

```bash
# 安裝前端 + 後端依賴
npm install

# 新增後端依賴
npm install express mongoose cors dotenv

# 新增後端開發依賴
npm install -D @types/express @types/cors @types/node tsx nodemon concurrently

# 新增前端依賴
npm install axios uuid

# 新增前端開發依賴
npm install -D @types/uuid
```

### 3. 環境變數設置

複製環境變數範例檔案：

```bash
cp .env.example .env
```

編輯 `.env` 檔案：

```bash
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mmquiz?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# Frontend (Vite 使用)
VITE_API_URL=http://localhost:5000/api
```

### 4. TypeScript 配置

建立後端 TypeScript 配置檔案：

**`server/tsconfig.json`**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. 更新 package.json Scripts

在 `package.json` 中新增以下 scripts：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",

    "server": "nodemon --watch server/src --ext ts --exec tsx server/src/server.ts",
    "server:build": "tsc -p server/tsconfig.json",
    "server:start": "node server/dist/server.js",

    "dev:all": "concurrently \"npm run dev\" \"npm run server\"",

    "migrate:questions": "tsx server/src/scripts/migrate-questions.ts"
  }
}
```

### 6. Vite Proxy 配置

更新 `vite.config.ts`：

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

---

## MongoDB Atlas 配置

### 1. 建立 MongoDB Atlas 帳號

1. 前往 [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. 註冊免費帳號
3. 建立新的 Cluster（選擇 Free tier - M0）

### 2. 設定資料庫存取

1. **Database Access**：

   - 建立資料庫使用者
   - Username: `mmquiz_admin`（範例）
   - Password: 產生強密碼並記錄

2. **Network Access**：
   - 新增 IP Address: `0.0.0.0/0`（允許所有 IP，開發用）
   - 生產環境應限制特定 IP

### 3. 取得連接字串

1. 點選 "Connect" → "Connect your application"
2. 選擇 Driver: Node.js, Version: 5.5 or later
3. 複製連接字串：
4. 修改連接字串：
   - 替換 `<password>` 為實際密碼
   - 在 `mongodb.net/` 後加上資料庫名稱 `mmquiz`
   - 最終格式：

### 4. 測試連接

建立測試腳本 `server/src/scripts/test-connection.ts`：

```typescript
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB connection successful!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

testConnection();
```

執行測試：

```bash
tsx server/src/scripts/test-connection.ts
```

---

## 專案結構說明

### 後端目錄結構

```
server/
├── src/
│   ├── models/              # Mongoose 模型
│   │   ├── Question.ts
│   │   ├── Quiz.ts
│   │   └── Answer.ts
│   │
│   ├── routes/              # API 路由定義
│   │   ├── questions.ts
│   │   ├── quizzes.ts
│   │   └── analytics.ts
│   │
│   ├── controllers/         # 業務邏輯處理
│   │   ├── questionController.ts
│   │   ├── quizController.ts
│   │   └── analyticsController.ts
│   │
│   ├── middleware/          # 中介軟體
│   │   └── errorHandler.ts
│   │
│   ├── config/              # 配置檔案
│   │   └── database.ts
│   │
│   ├── scripts/             # 工具腳本
│   │   ├── test-connection.ts
│   │   └── migrate-questions.ts
│   │
│   └── server.ts            # Express 入口點
│
├── dist/                    # TypeScript 編譯輸出
└── tsconfig.json            # TypeScript 配置
```

### 前端新增目錄

```
src/
├── services/               # 新增：API 服務層
│   ├── api.ts              # Axios 實例配置
│   ├── questionService.ts
│   ├── quizService.ts
│   └── analyticsService.ts
│
├── utils/                  # 新增：工具函數
│   └── userStorage.ts      # localStorage UUID 管理
│
└── types/                  # 新增：TypeScript 型別
    ├── question.ts
    ├── quiz.ts
    └── analytics.ts
```

---

## 開發工作流程

### Phase 1: 後端 API 開發

#### 1.1 建立資料庫連接

**`server/src/config/database.ts`**:

```typescript
import mongoose from "mongoose";

export async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}
```

#### 1.2 建立 Mongoose 模型

參考 `specs/001-database-question-bank/data-model.md` 建立：

- `server/src/models/Question.ts`
- `server/src/models/Quiz.ts`
- `server/src/models/Answer.ts`

#### 1.3 建立 Express Server

**`server/src/server.ts`**:

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import questionsRouter from "./routes/questions";
import quizzesRouter from "./routes/quizzes";
import analyticsRouter from "./routes/analytics";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/questions", questionsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/analytics", analyticsRouter);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
```

#### 1.4 實作 API Endpoints

參考 `specs/001-database-question-bank/contracts/` 中的 API 規格：

1. **Questions API** (`questions-api.md`)

   - GET /api/questions
   - GET /api/questions/:id
   - POST /api/questions
   - PUT /api/questions/:id
   - DELETE /api/questions/:id

2. **Quizzes API** (`quizzes-api.md`)

   - POST /api/quizzes
   - POST /api/quizzes/:id/submit
   - GET /api/quizzes/:id
   - GET /api/quizzes

3. **Analytics API** (`analytics-api.md`)
   - GET /api/analytics/questions/:id
   - GET /api/analytics/score-distribution
   - GET /api/analytics/summary

#### 1.5 啟動後端開發模式

```bash
npm run server
```

使用工具測試 API（如 Postman, Thunder Client, curl）：

```bash
# 測試取得題目列表
curl http://localhost:5000/api/questions

# 測試新增題目
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "single",
    "question": "測試題目",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "difficulty": "簡單",
    "book": "醫療靈媒"
  }'
```

### Phase 2: 前端整合

#### 2.1 建立 TypeScript 型別

**`src/types/question.ts`**:

```typescript
export type QuestionType = "single" | "multiple" | "fill";
export type Difficulty = "簡單" | "中等" | "困難";

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
```

參考 `data-model.md` 建立其他型別檔案。

#### 2.2 設置 Axios

**`src/services/api.ts`**:

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
```

#### 2.3 實作 Service 層

**`src/services/questionService.ts`**:

```typescript
import api from "./api";
import { Question } from "../types/question";

export async function fetchQuestions(params?: {
  book?: string;
  difficulty?: string;
  type?: string;
  limit?: number;
  random?: boolean;
}): Promise<Question[]> {
  const response = await api.get("/questions", { params });
  return response.data.data;
}

export async function fetchQuizQuestions(
  book: string,
  difficulty: string
): Promise<Question[]> {
  const [singles, multiples, fills] = await Promise.all([
    fetchQuestions({
      book,
      difficulty,
      type: "single",
      limit: 10,
      random: true,
    }),
    fetchQuestions({
      book,
      difficulty,
      type: "multiple",
      limit: 5,
      random: true,
    }),
    fetchQuestions({ book, difficulty, type: "fill", limit: 5, random: true }),
  ]);

  return [...singles, ...multiples, ...fills];
}

export async function createQuestion(
  data: Partial<Question>
): Promise<Question> {
  const response = await api.post("/questions", data);
  return response.data.data;
}

export async function updateQuestion(
  id: string,
  data: Partial<Question>
): Promise<Question> {
  const response = await api.put(`/questions/${id}`, data);
  return response.data.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await api.delete(`/questions/${id}`);
}
```

類似地建立 `quizService.ts` 和 `analyticsService.ts`。

#### 2.4 實作 User Storage

**`src/utils/userStorage.ts`**:

```typescript
import { v4 as uuidv4 } from "uuid";

const USER_ID_KEY = "mmquiz_user_id";

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log("Generated new user ID:", userId);
  }

  return userId;
}

export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}
```

#### 2.5 修改現有組件

參考 `spec.md` 中的 User Stories，修改以下檔案：

1. **QuizPage.tsx**:

   - 使用 `fetchQuizQuestions()` 載入題目
   - 使用 `createQuiz()` 建立測驗記錄
   - 使用 `submitQuiz()` 提交答案

2. **ResultPage.tsx**:

   - 從 API 回傳的結果顯示分數和錯題
   - 處理「題目已刪除」情況

3. **AdminDashboard.tsx**:

   - 新增題庫管理連結

4. **QuestionBank.tsx**（新增）:

   - 實作題目 CRUD 介面
   - 顯示題目正確率

5. **Analytics.tsx**（新增）:
   - 顯示得分分布圖表
   - 顯示統計摘要

### Phase 3: 資料遷移

#### 3.1 匯出現有題目

從現有的 TypeScript 檔案中提取題目資料，轉換為 JSON 格式。

#### 3.2 建立遷移腳本

**`server/src/scripts/migrate-questions.ts`**:

```typescript
import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../models/Question";
import existingQuestions from "./existing-questions.json";

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // 清空現有題目（可選）
    // await Question.deleteMany({});

    // 匯入題目
    for (const q of existingQuestions) {
      await Question.create(q);
      console.log(`✅ Imported: ${q.question.substring(0, 50)}...`);
    }

    console.log(
      `\n🎉 Successfully imported ${existingQuestions.length} questions`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
```

#### 3.3 執行遷移

```bash
npm run migrate:questions
```

---

## API 開發指南

### Controller 模式範例

**`server/src/controllers/questionController.ts`**:

```typescript
import { Request, Response, NextFunction } from "express";
import Question from "../models/Question";

export async function getQuestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { book, difficulty, type, limit = 20, random } = req.query;

    const query: any = {};
    if (book) query.book = book;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;

    let questionsQuery = Question.find(query).limit(Number(limit));

    if (random === "true") {
      // 使用 MongoDB aggregation 進行隨機抽取
      const questions = await Question.aggregate([
        { $match: query },
        { $sample: { size: Number(limit) } },
      ]);
      return res.json({
        success: true,
        data: questions,
        count: questions.length,
      });
    }

    const questions = await questionsQuery;
    res.json({ success: true, data: questions, count: questions.length });
  } catch (error) {
    next(error);
  }
}

export async function createQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({
      success: true,
      data: question,
      message: "Question created successfully",
    });
  } catch (error) {
    next(error);
  }
}

// ... 其他 CRUD 方法
```

### Router 模式範例

**`server/src/routes/questions.ts`**:

```typescript
import express from "express";
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController";

const router = express.Router();

router.get("/", getQuestions);
router.get("/:id", getQuestion);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
```

### 錯誤處理 Middleware

**`server/src/middleware/errorHandler.ts`**:

```typescript
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
```

---

## 前端整合指南

### 開始測驗流程

```typescript
// src/pages/QuizPage.tsx

import { useState, useEffect } from "react";
import { fetchQuizQuestions } from "../services/questionService";
import { createQuiz } from "../services/quizService";
import { getUserId } from "../utils/userStorage";

export function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function startQuiz() {
      try {
        const userId = getUserId();
        const book = "醫療靈媒";
        const difficulty = "中等";

        // 1. 隨機抽取 20 題
        const quizQuestions = await fetchQuizQuestions(book, difficulty);

        if (quizQuestions.length !== 20) {
          throw new Error("Failed to load 20 questions");
        }

        // 2. 建立測驗記錄
        const quiz = await createQuiz({
          userId,
          book,
          difficulty,
          questions: quizQuestions.map((q) => q._id),
        });

        setQuestions(quizQuestions);
        setQuizId(quiz._id);
      } catch (error) {
        console.error("Failed to start quiz:", error);
      } finally {
        setLoading(false);
      }
    }

    startQuiz();
  }, []);

  // ... 渲染測驗 UI
}
```

### 提交測驗流程

```typescript
async function handleSubmit() {
  try {
    const answers = questions.map((q, index) => ({
      questionId: q._id,
      userAnswer: userAnswers[index] || null,
    }));

    const result = await submitQuiz(quizId, answers);

    // 導航到結果頁面
    onNavigate("result", result);
  } catch (error) {
    console.error("Failed to submit quiz:", error);
  }
}
```

---

## 測試與除錯

### 後端 API 測試

使用 Thunder Client（VS Code Extension）或 Postman：

#### 測試 Questions API

```http
### 取得題目列表
GET http://localhost:5000/api/questions?book=醫療靈媒&difficulty=中等&type=single&limit=10&random=true

### 新增題目
POST http://localhost:5000/api/questions
Content-Type: application/json

{
  "type": "single",
  "question": "芹菜汁對肝臟的主要功效是？",
  "options": ["排毒", "補充能量", "增強記憶", "提升視力"],
  "correctAnswer": "排毒",
  "difficulty": "中等",
  "book": "醫療靈媒"
}
```

### 前端整合測試

1. **檢查 Axios 請求**：

   - 開啟瀏覽器開發者工具 → Network tab
   - 查看 API 請求和回應

2. **檢查 localStorage**：

   - 開發者工具 → Application → Local Storage
   - 確認 `mmquiz_user_id` 存在

3. **Console Logs**：
   - 在關鍵位置加入 `console.log` 追蹤資料流

### 常見除錯指令

```bash
# 檢查 MongoDB 連接
tsx server/src/scripts/test-connection.ts

# 檢查後端啟動狀態
curl http://localhost:5000/api/questions

# 檢查前端代理
curl http://localhost:3000/api/questions
```

---

## 常見問題

### Q1: CORS 錯誤

**錯誤訊息**:

```
Access to XMLHttpRequest at 'http://localhost:5000/api/questions' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**解決方法**:
確保後端已安裝並使用 `cors` middleware：

```typescript
import cors from "cors";
app.use(cors());
```

### Q2: MongoDB 連接失敗

**錯誤訊息**:

```
MongooseServerSelectionError: connect ECONNREFUSED
```

**檢查清單**:

1. `.env` 中的 `MONGODB_URI` 是否正確
2. MongoDB Atlas IP 白名單是否包含 `0.0.0.0/0`
3. 資料庫使用者密碼是否正確
4. 網路連線是否正常

### Q3: Vite Proxy 無效

**症狀**: 前端無法呼叫後端 API

**解決方法**:

1. 確認 `vite.config.ts` 配置正確
2. 重新啟動 Vite 開發伺服器
3. 確認後端在 port 5000 運行

### Q4: TypeScript 型別錯誤

**症狀**: 前後端型別不一致

**解決方法**:
使用共用型別檔案：

```typescript
// src/types/question.ts (前端使用)
// server/src/models/Question.ts 的介面繼承前端型別
import { IQuestion as BaseQuestion } from "../../src/types/question";
```

### Q5: 隨機抽取重複題目

**症狀**: 測驗中出現重複題目

**原因**: 題庫不足 20 題

**解決方法**:
前端加入驗證：

```typescript
if (questions.length !== 20) {
  throw new Error("題庫不足，請管理員新增更多題目");
}
```

---

## 開發檢查清單

### 後端 Checklist

- [ ] MongoDB Atlas 配置完成
- [ ] `.env` 檔案設置完成
- [ ] 資料庫連接測試通過
- [ ] Question Model 建立完成
- [ ] Quiz Model 建立完成
- [ ] Answer Model 建立完成
- [ ] Questions API 實作完成
- [ ] Quizzes API 實作完成
- [ ] Analytics API 實作完成
- [ ] 錯誤處理 middleware 實作
- [ ] 題目遷移腳本執行成功

### 前端 Checklist

- [ ] Axios 配置完成
- [ ] TypeScript 型別定義完成
- [ ] questionService 實作完成
- [ ] quizService 實作完成
- [ ] analyticsService 實作完成
- [ ] userStorage 實作完成
- [ ] QuizPage 修改完成
- [ ] ResultPage 修改完成
- [ ] AdminDashboard 修改完成
- [ ] QuestionBank 頁面實作完成
- [ ] Analytics 頁面實作完成

### 測試 Checklist

- [ ] 可成功開始測驗（載入 20 題）
- [ ] 可提交測驗並顯示成績
- [ ] 可顯示錯題詳情
- [ ] 管理員可新增題目
- [ ] 管理員可編輯題目
- [ ] 管理員可刪除題目
- [ ] 可查詢題目正確率
- [ ] 可查詢得分分布
- [ ] localStorage UUID 正常運作
- [ ] 重新整理後測驗重新開始

---

## 下一步

完成開發後，參考 `specs/001-database-question-bank/tasks.md`（由 `/speckit.tasks` 產生）執行實作任務。

**開發順序建議**:

1. Phase 1: 後端基礎建設（2-3 天）

   - MongoDB 連接、Models、基礎 CRUD API

2. Phase 2: 測驗核心功能（2-3 天）

   - 隨機抽題、測驗記錄、計分邏輯

3. Phase 3: 前端整合（2-3 天）

   - 修改現有頁面、Service 層整合

4. Phase 4: 管理功能（2-3 天）

   - 題庫 CRUD 介面、資料遷移

5. Phase 5: 統計分析（2-3 天）
   - 正確率查詢、得分分布圖表

**總估計時間**: 10-15 天

---

**參考文件**:

- [spec.md](./spec.md) - 功能規格
- [plan.md](./plan.md) - 實作計畫
- [data-model.md](./data-model.md) - 資料模型
- [contracts/](./contracts/) - API 規格
