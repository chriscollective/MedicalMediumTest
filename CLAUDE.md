# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個針對醫療靈媒書籍的測驗應用程式，採用 **全端架構**，前端使用 React、TypeScript 和 Vite 建構，後端使用 Node.js、Express 和 MongoDB Atlas。應用程式採用自然主題的 UI 設計並搭配動畫效果，允許使用者根據選擇的書籍和難度進行測驗，並提供完整的管理後台用於管理題目、查看分析數據和排行榜。

## 開發指令

**安裝依賴套件：**
```bash
npm i
```

**同時啟動前端和後端開發伺服器：**
```bash
npm run dev:all
```
- 前端運行在 http://localhost:5173（Vite 預設端口）
- 後端運行在 http://localhost:5000

**僅啟動前端開發伺服器：**
```bash
npm run dev
```

**僅啟動後端開發伺服器：**
```bash
npm run server
```
使用 nodemon 自動重啟，監聽 server/src 目錄變更。

**建構生產版本：**
```bash
npm run build           # 建構前端
npm run server:build    # 建構後端
npm run server:start    # 啟動生產版後端
```

**資料庫相關指令：**
```bash
npm run migrate:questions  # 遷移題目資料到 MongoDB
```

## 應用程式架構

### 前端架構

#### 狀態管理與路由

這是一個**單頁應用程式（SPA），採用手動頁面路由**。主要的 App.tsx 組件使用 `useState` 和條件渲染來管理所有導航狀態，而不是使用路由庫。

- **App.tsx**：中央狀態管理器和頁面路由器
  - 使用 `currentPage` 狀態控制渲染哪個頁面組件
  - 維護 `quizState` 用於測驗數據（書籍、難度、答案、分數）
  - 處理 8 個頁面之間的導航：landing、quiz、result、admin-login、admin-dashboard、analytics、questions、leaderboard
  - **重要**：所有頁面轉換都通過 App.tsx 的回調處理函數進行

### 後端架構

後端位於 `server/` 目錄，採用 Express.js + MongoDB 架構：

#### 目錄結構
```
server/
├── src/
│   ├── config/          # 資料庫連線設定
│   ├── models/          # Mongoose 資料模型
│   │   ├── Question.ts  # 題目模型
│   │   ├── Quiz.ts      # 測驗記錄模型
│   │   ├── Admin.ts     # 管理員模型
│   │   ├── Leaderboard.ts # 排行榜模型
│   │   └── Book.ts      # 書籍模型
│   ├── controllers/     # 業務邏輯控制器
│   ├── routes/          # API 路由定義
│   │   ├── questions.ts # 題目相關 API
│   │   ├── quizzes.ts   # 測驗相關 API
│   │   ├── admin.ts     # 管理員 API
│   │   ├── analytics.ts # 統計分析 API
│   │   ├── leaderboardRoutes.ts # 排行榜 API
│   │   └── books.ts     # 書籍管理 API
│   ├── middleware/      # 中間件（錯誤處理、認證）
│   ├── scripts/         # 資料庫腳本工具
│   └── server.ts        # Express 應用程式入口
└── tsconfig.json
```

#### API 端點

**基礎路由**: `http://localhost:5000/api`

- **GET /health** - 伺服器健康檢查
- **POST /admin/login** - 管理員登入
- **GET /questions** - 取得題目（支援書籍、難度篩選）
- **POST /quizzes** - 建立測驗記錄
- **POST /quizzes/:id/submit** - 提交測驗答案
- **GET /analytics/summary** - 統計摘要
- **GET /analytics/grade-distribution** - 等級分布
- **GET /analytics/book-distribution** - 書籍參與比例
- **GET /analytics/wrong-questions** - 錯題排行榜
- **GET /leaderboard** - 排行榜資料
- **GET /books** - 書籍列表
- **POST /books** - 新增書籍（需管理員權限）

#### 頁面組件

位於 `src/pages/`：

- **LandingPage**：書籍選擇（可多選）和難度選擇器（初階/進階）
- **QuizPage**：分頁測驗介面（每頁 5 題，共 4 頁 = 20 題）
  - 使用 AnimatePresence 實現帶方向性的頁面轉場動畫
  - 整合後端 API，從 MongoDB 動態載入題目
  - 支援單本書或多本書混合出題
  - 完整的測驗提交流程（建立記錄 → 提交答案 → 計算成績）
  - 包含 loading 狀態和錯誤處理，API 失敗時自動降級到 mock 資料
- **ResultPage**：分數顯示、等級評定和錯題回顧
  - 顯示測驗成績和對應等級（S/A+/A/B+/B/C+/F）
  - 錯題詳細解析
  - 排行榜提交功能
- **AdminLogin**：管理員登入介面
  - 整合後端 JWT 認證
  - Token 儲存於 localStorage
- **AdminDashboard**：管理員選單中心
  - 導航至題目管理、統計分析、排行榜等功能
- **Analytics**：測驗統計分析頁面
  - 累積測驗人數、次數、平均等級、最熱門書籍
  - 等級分布圖表（長條圖）
  - 書籍參與比例圖表（圓餅圖）
  - 錯題排行榜（表格）
  - 使用 Recharts 進行資料視覺化
- **QuestionBank**：題目管理介面
  - 題目列表顯示與篩選
  - 新增、編輯、刪除題目功能
  - 支援三種題型：單選、多選、填空
- **Leaderboard**：全域排行榜
  - 顯示各書籍的前 100 名玩家
  - 支援書籍篩選
  - 即時更新排名

#### 前端服務層

位於 `src/services/`，封裝所有 API 呼叫：

- **api.ts**：Axios 實例設定，包含請求/回應攔截器
- **authService.ts**：管理員認證服務（登入、登出、Token 管理）
- **questionService.ts**：題目相關操作（取得題目、CRUD）
- **quizService.ts**：測驗流程（建立測驗、提交答案）
- **analyticsService.ts**：統計資料獲取
- **leaderboardService.ts**：排行榜操作（取得排行、提交成績）
- **bookService.ts**：書籍管理

### 題目系統

題目由 `src/components/QuestionCard.tsx` 中的 `Question` 介面定義：

```typescript
interface Question {
  id: string;
  type: 'single' | 'multiple' | 'cloze';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  source?: string;             // 書籍來源
  explanation?: string;
}
```

**題目類型：**
1. **single**：單選按鈕（一個答案）
2. **multiple**：複選框（多個正確答案）
3. **cloze**：克漏字題（依序選擇多個答案）

**資料來源：**
- 題目儲存在 MongoDB Atlas 資料庫中
- 前端通過 `questionService.ts` 向後端 API 請求題目
- 後端根據書籍和難度篩選條件隨機抽取 20 題
- 支援多本書混合出題（使用 `fetchMixedQuizQuestions` 函數）
- Fallback 機制：API 失敗時使用 `src/data/mockQuestions.ts` 中的模擬資料

**答案格式轉換：**
- 前端 UI：使用 string 或 string[] 表示答案
- 後端/資料庫：使用 number 或 number[]（選項索引）表示答案
- QuizPage 負責在提交時進行格式轉換

### UI 組件

專案使用 **shadcn/ui 組件**（Radix UI + Tailwind CSS）：
- 位於 `src/components/ui/`
- 預配置了完整的 Radix UI 組件庫
- 自訂的自然主題組件：
  - **NatureDecoration**：裝飾性植物/草本 SVG 元素
  - **FloatingHerbs**：浮動動畫元素
  - **NaturalPattern**：背景圖案疊加
  - **NatureAccents**：簡化的裝飾元素

### 設計系統

**色彩配置**（自然風格）：
- 主要綠色：`#A8CBB7`（鼠尾草綠）
- 強調金色：`#E5C17A`（暖米金色）
- 背景色：`#FAFAF7`（灰白色）
- 次要色：`#F7E6C3`（淺奶油色）
- 文字色：`#2d3436`（深灰）、`#636e72`（中灰）

**動畫庫**：使用 `motion/react`（Framer Motion）實現：
- 使用 AnimatePresence 的頁面轉場
- 交錯列表動畫
- 懸停效果和微交互

### 路徑別名

在 vite.config.ts 中配置：
- `@/` 對應到 `src/`
- 所有 Radix UI 和其他依賴項都有版本特定的別名

## 重要實作細節

### 分數計算邏輯

位於 App.tsx 的 `handleQuizComplete` 函數：
- **單選/填空題**：直接字串比較
- **多選題**：陣列長度相等 + 所有元素匹配（順序無關）
- 錯誤答案會與題目引用和使用者答案一起儲存以供回顧

### 測驗分頁

QuizPage 每頁顯示 5 題，包含：
- 前進/後退導航與動畫轉場
- 進度指示器（固定在頂部）
- 右下角浮動操作按鈕
- 中央頁碼計數器

### 管理員認證流程

管理員認證使用 **JWT Token** 機制：
1. 使用者在 AdminLogin 頁面輸入帳號密碼
2. 前端呼叫 `authService.login()` 向後端發送請求
3. 後端驗證帳號密碼（使用 bcrypt 比對加密密碼）
4. 驗證成功後回傳 JWT Token
5. Token 儲存在 localStorage 中
6. 後續需要權限的 API 請求會在 Header 中帶入 Token
7. 後端 middleware 驗證 Token 有效性

**初始管理員帳號：**
- 使用 `npm run server` 啟動後端時會自動建立預設管理員
- 或手動執行腳本建立：`tsx server/src/scripts/seed-admin.ts`

## 技術堆疊

### 前端
- **React 18** with TypeScript
- **Vite 6** 使用 SWC 進行快速建構
- **Tailwind CSS** 用於樣式
- **Radix UI** 用於無障礙 UI 基礎元件
- **Framer Motion**（`motion/react`）用於動畫
- **Lucide React** 用於圖示
- **Recharts** 用於資料視覺化
- **Axios** 用於 HTTP 請求
- **React Hook Form** 用於表單處理

### 後端
- **Node.js** with TypeScript
- **Express.js** 網頁伺服器框架
- **MongoDB** 透過 **Mongoose** ODM
- **MongoDB Atlas** 雲端資料庫託管
- **JWT (jsonwebtoken)** 用於管理員認證
- **bcrypt** 用於密碼加密
- **CORS** 用於跨域資源共享
- **dotenv** 用於環境變數管理

### 開發工具
- **tsx** - TypeScript 執行器
- **nodemon** - 自動重啟開發伺服器
- **concurrently** - 同時執行多個指令

## 環境變數配置

專案需要以下環境變數（請參考 `.env.example`）：

```bash
# MongoDB Atlas 連線字串
MONGODB_URI=your_mongodb_atlas_connection_string

# 後端伺服器端口
PORT=5000
NODE_ENV=development

# 前端 API 位址（Vite 使用）
VITE_API_URL=http://localhost:5000/api
```

**設定步驟：**
1. 複製 `.env.example` 為 `.env`
2. 設定 MongoDB Atlas 連線字串
3. 確認前後端端口設定正確

## 資料庫架構

### MongoDB Collections

**questions** - 題目資料
- `_id`: ObjectId
- `type`: 'single' | 'multiple' | 'cloze'
- `question`: 題目文字
- `options`: 選項陣列
- `correctAnswer`: number | number[]（正確答案索引）
- `source`: 書籍來源
- `difficulty`: '初階' | '進階'
- `explanation`: 題目解析

**quizzes** - 測驗記錄
- `_id`: ObjectId
- `userId`: 使用者 ID（UUID）
- `book`: 書籍名稱
- `difficulty`: 難度
- `questions`: 題目 ID 陣列
- `answers`: 使用者答案陣列
- `answerBitmap`: 答題結果位元圖（'1'正確/'0'錯誤）
- `correctCount`: 答對題數
- `totalQuestions`: 總題數
- `grade`: 等級（S/A+/A/B+/B/C+/F）
- `completedAt`: 完成時間

**leaderboards** - 排行榜
- `_id`: ObjectId
- `userId`: 使用者 ID
- `username`: 暱稱
- `book`: 書籍名稱
- `difficulty`: 難度
- `score`: 分數
- `grade`: 等級
- `quizId`: 關聯的測驗 ID
- `createdAt`: 建立時間

**admins** - 管理員帳號
- `_id`: ObjectId
- `username`: 帳號
- `password`: 加密密碼（bcrypt）
- `createdAt`: 建立時間

**books** - 書籍資料
- `_id`: ObjectId
- `title`: 書籍名稱
- `displayName`: 顯示名稱
- `isActive`: 是否啟用
- `createdAt`: 建立時間

## 原始設計參考

此專案是從 Figma 設計生成的，可在以下位置查看：
https://www.figma.com/design/a3i2fvV92IFl19Lom9aKXH/醫療靈媒隨堂測驗介面設計

## 已實作功能

### 核心功能
- ✅ 多書籍選擇與測驗（支援單本或多本混合）
- ✅ 雙難度系統（初階/進階）
- ✅ 三種題型（單選、多選、填空）
- ✅ 分頁測驗介面（每頁 5 題）
- ✅ 成績計算與等級評定
- ✅ 錯題回顧與解析

### 後端系統
- ✅ MongoDB Atlas 資料庫整合
- ✅ RESTful API 架構
- ✅ JWT 管理員認證系統
- ✅ 題目隨機抽取演算法
- ✅ 測驗記錄儲存
- ✅ 統計資料計算

### 管理功能
- ✅ 管理員登入/登出
- ✅ 題目管理（CRUD）
- ✅ 書籍管理（新增、停用）
- ✅ 統計分析儀表板
  - 累積使用者數、測驗次數
  - 等級分布圖表
  - 書籍參與比例
  - 錯題排行榜

### 排行榜系統
- ✅ 全域排行榜（各書籍 Top 100）
- ✅ 成績提交功能
- ✅ 書籍篩選

## 最近變更

### 2024-11-01
- ✅ 完成排行榜功能
- ✅ 新增書籍管理功能（僅在後台）

### 2024-10-31 及更早
- ✅ 建立 MongoDB Atlas 資料庫架構
- ✅ 實作完整後端 API
- ✅ 整合前端與後端
- ✅ 完成統計分析頁面
- ✅ 實作管理員認證系統

---

## 與 Claude 的協作規則

### 溝通語言
- **必須使用繁體中文**回答和對話
- 所有說明、註解、文件都使用繁體中文

### 程式碼風格
- **簡潔有效**：避免過度工程，直接解決問題
- **可讀性優先**：清晰的變數命名、適當的註解
- **可維護性**：模組化設計、遵循 DRY 原則
- 使用 TypeScript strict mode
- 錯誤處理必須完善

### Git 工作流程
- **每次修改都要 commit**：完成一個功能或修正後立即執行 `git add . && git commit`
- **Commit message 格式**：
  - 使用繁體中文
  - 簡潔描述變更內容
  - 包含 🤖 Generated with Claude Code 標記
- **Push 權限**：
  - ⚠️ **絕對不可主動 push**
  - 每次 push 前**必須徵求使用者同意**
  - 只在使用者明確要求時才執行 push

### 範例 Commit Message
```
加入 NoSQL 注入防護機制

- 安裝 express-mongo-sanitize 套件
- 建立查詢參數驗證中間件
- 修正 questionController 的安全問題
- 整合三層防護機制

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
