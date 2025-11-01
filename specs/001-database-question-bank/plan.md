# Implementation Plan: 資料庫題庫系統與分析功能

**Branch**: `001-database-question-bank` | **Date**: 2025-10-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-database-question-bank/spec.md`

## Summary

將現有硬編碼題目遷移到 MongoDB 資料庫，實作動態題目載入、使用者作答記錄追蹤、管理員 CRUD 介面、以及統計分析功能。採用 Express + MongoDB 後端搭配現有 React + Vite 前端，保持單體架構。

核心功能：
- 從資料庫隨機抽取20題（1-10單選、11-15多選、16-20填空）
- 記錄使用者作答歷史（localStorage UUID識別）
- 管理員題庫 CRUD 操作
- 題目正確率和使用者得分分布即時統計

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x + React 18
- Backend: Node.js 18+ + TypeScript 5.x

**Primary Dependencies**:
- Frontend: React 18, Vite 6, Axios, Radix UI, Tailwind CSS, Framer Motion
- Backend: Express 4.x, Mongoose (MongoDB ODM), cors, dotenv
- Database: MongoDB Atlas (雲端免費方案)

**Storage**: MongoDB Atlas (雲端托管)

**Testing**: 暫不實作測試（符合 MVP 快速迭代原則，未來可加入）

**Target Platform**: Web 瀏覽器（Chrome, Firefox, Safari, Edge 現代版本）

**Project Type**: 單體 Web 應用（前後端共存於單一專案）

**Performance Goals**:
- 題目載入：<2秒（SC-001）
- 統計查詢：<3秒（SC-005, SC-007）
- 並發支援：10人同時作答（SC-010）

**Constraints**:
- 單體架構：前後端不分離，共用一個專案
- 簡單優先：避免過度抽象和設計模式
- localStorage 依賴：使用者識別依賴瀏覽器本地儲存
- 無進度保存：重新整理後測驗需重新開始
- 即時統計：不預先計算，查詢時即時計算

**Scale/Scope**:
- 題庫規模：~1000題
- 使用者：<50人並發
- 作答記錄：<10,000筆（初期）
- 管理員：1-3人

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. 簡單優先 (Simplicity First)

**符合度**: PASS

- ✅ 使用 Mongoose ODM 而非原生 MongoDB driver（降低複雜度）
- ✅ RESTful API 設計（標準且直觀）
- ✅ localStorage UUID 簡易識別（無需完整用戶系統）
- ✅ 即時統計計算（避免快取同步複雜度）
- ✅ Vite proxy 開發模式（標準方案）

**潛在風險**: Express 後端增加了一層複雜度，但為必要權衡以實現資料庫功能。

### ✅ II. 品質至上 (Quality Over Quantity)

**符合度**: PASS

- ✅ TypeScript 用於前後端（型別安全）
- ✅ Mongoose Schema 驗證（資料品質保證）
- ✅ API 錯誤處理（友善錯誤訊息）
- ⚠️ 暫無測試（MVP 階段可接受，未來需補充）

### ⚠️ III. 單體架構 (Monolithic Architecture)

**符合度**: CONDITIONAL PASS（需正當化）

- ⚠️ 引入 Express 後端（技術上是前後端分離）
- ✅ 但前後端共存於單一專案
- ✅ 單一 git 儲存庫
- ✅ 共用 node_modules 和 package.json
- ✅ 部署為單一應用

**正當化**: MongoDB 需要後端 API 層進行安全的資料庫操作。直接從前端連接資料庫會暴露憑證且無法實作細緻的存取控制。Express 是最小化的後端實作，符合「實用主義」原則。

### ✅ IV. 實用主義 (Pragmatism Over Perfection)

**符合度**: PASS

- ✅ MongoDB Atlas 而非自建（減少運維負擔）
- ✅ Axios 而非 Fetch（更好的錯誤處理）
- ✅ 不保存進度（簡化實作）
- ✅ 只存題目ID（節省儲存空間）
- ✅ 完全隨機抽題（避免複雜演算法）

### ✅ V. 漸進式改進 (Incremental Improvement)

**符合度**: PASS

- ✅ MVP 優先（P1 功能先行）
- ✅ 統計功能為 P3（可延後）
- ✅ 無測試但功能可用（未來迭代）

### 📋 Complexity Tracking

無憲章違反需要記錄。Express 後端已在上方 III. 單體架構中正當化。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
MMquiz/  (專案根目錄)
├── src/                          # React 前端程式碼 (現有)
│   ├── components/               # UI 組件
│   │   ├── ui/                  # shadcn/ui 組件
│   │   ├── QuestionCard.tsx     # 題目卡片 (需修改以支援資料庫題目)
│   │   └── ...                  # 其他組件
│   ├── pages/                    # 頁面組件
│   │   ├── QuizPage.tsx         # 測驗頁面 (需修改以載入資料庫題目)
│   │   ├── ResultPage.tsx       # 結果頁面 (需修改錯題顯示邏輯)
│   │   ├── AdminDashboard.tsx   # 管理員儀表板
│   │   ├── QuestionBank.tsx     # 題庫管理頁面 (需新增 CRUD UI)
│   │   └── Analytics.tsx        # 分析頁面 (需新增統計圖表)
│   ├── services/                # 新增：API 服務層
│   │   ├── api.ts              # Axios 實例配置
│   │   ├── questionService.ts   # 題目 CRUD API 呼叫
│   │   ├── quizService.ts       # 測驗 API 呼叫
│   │   └── analyticsService.ts  # 統計 API 呼叫
│   ├── utils/                    # 新增：工具函數
│   │   └── userStorage.ts       # localStorage UUID 管理
│   ├── types/                    # 新增：TypeScript 型別定義
│   │   ├── question.ts          # Question 介面
│   │   ├── quiz.ts              # Quiz, Answer 介面
│   │   └── analytics.ts         # 統計相關介面
│   ├── App.tsx                   # 主應用 (需修改測驗流程)
│   └── main.tsx                  # 入口點
│
├── server/                       # 新增：Express 後端
│   ├── src/
│   │   ├── models/              # Mongoose 模型
│   │   │   ├── Question.ts     # 題目模型
│   │   │   ├── Quiz.ts         # 測驗記錄模型
│   │   │   └── Answer.ts       # 作答記錄模型
│   │   ├── routes/              # API 路由
│   │   │   ├── questions.ts    # /api/questions 路由
│   │   │   ├── quizzes.ts      # /api/quizzes 路由
│   │   │   └── analytics.ts    # /api/analytics 路由
│   │   ├── controllers/         # 路由處理器
│   │   │   ├── questionController.ts
│   │   │   ├── quizController.ts
│   │   │   └── analyticsController.ts
│   │   ├── middleware/          # 中介軟體
│   │   │   └── errorHandler.ts # 錯誤處理
│   │   ├── config/              # 配置
│   │   │   └── database.ts     # MongoDB 連接
│   │   └── server.ts            # Express 應用入口
│   └── dist/                     # TypeScript 編譯輸出
│
├── public/                       # 靜態資源 (現有)
├── vite.config.ts                # Vite 配置 (需新增 proxy 設定)
├── tsconfig.json                 # 前端 TypeScript 配置
├── server/tsconfig.json          # 後端 TypeScript 配置 (新增)
├── package.json                  # 專案依賴 (需新增後端依賴)
├── .env.example                  # 環境變數範例 (新增)
├── .env                          # 環境變數 (本地，不提交)
└── README.md                     # 專案說明
```

**Structure Decision**:

選擇「單一專案單體架構」方案：

1. **前端程式碼**：保留在 `src/` 目錄，延續現有結構
2. **後端程式碼**：新增 `server/` 目錄，包含 Express API
3. **共用配置**：單一 `package.json`，但後端有獨立的 `tsconfig.json`
4. **開發模式**：
   - Frontend: `npm run dev` (Vite on :3000, with proxy)
   - Backend: `npm run server` (Express on :5000)
   - Concurrent: `npm run dev:all` (同時啟動兩者)
5. **生產模式**：Express 服務編譯後的前端靜態檔案

此結構符合單體架構原則，同時保持前後端程式碼清晰分離以利維護。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
