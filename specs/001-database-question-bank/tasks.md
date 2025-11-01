# Tasks: 資料庫題庫系統與分析功能

**Input**: 設計文件來自 `/specs/001-database-question-bank/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可並行執行（不同檔案，無依賴關係）
- **[Story]**: 任務所屬的 User Story（US1, US2, US3, US4, US5）

---

## Phase 1: 專案設置 (Setup)

**目的**: 專案初始化和基礎結構建立

- [ ] T001 安裝後端依賴套件：express, mongoose, cors, dotenv
- [ ] T002 [P] 安裝後端開發依賴：@types/express, @types/cors, @types/node, tsx, nodemon, concurrently
- [ ] T003 [P] 安裝前端依賴：axios, uuid 和 @types/uuid
- [ ] T004 建立後端目錄結構：server/src/{models,routes,controllers,middleware,config,scripts}
- [ ] T005 建立前端新目錄：src/{services,utils,types}
- [ ] T006 建立後端 tsconfig.json（參考 quickstart.md）
- [ ] T007 更新 package.json 加入後端 scripts（server, server:build, dev:all）
- [ ] T008 [P] 更新 vite.config.ts 加入 /api proxy 設定
- [ ] T009 [P] 建立 .env.example 環境變數範例檔案
- [ ] T010 建立 .env 並設定 MONGODB_URI（參考 quickstart.md）

---

## Phase 2: 基礎建設 (Foundational)

**目的**: 核心基礎設施，所有 User Story 的前置需求

**⚠️ 關鍵**: 此階段完成前，不可開始任何 User Story 的實作

- [ ] T011 建立 MongoDB 連接設定：server/src/config/database.ts
- [ ] T012 [P] 建立 Question Model：server/src/models/Question.ts（參考 data-model.md）
- [ ] T013 [P] 建立 Quiz Model：server/src/models/Quiz.ts（參考 data-model.md）
- [ ] T014 [P] 建立 Answer Model：server/src/models/Answer.ts（參考 data-model.md）
- [ ] T015 建立錯誤處理 middleware：server/src/middleware/errorHandler.ts
- [ ] T016 建立 Express Server 入口：server/src/server.ts（基礎設定）
- [ ] T017 [P] 建立前端共用型別：src/types/{question.ts, quiz.ts, analytics.ts}
- [ ] T018 [P] 建立 Axios 實例：src/services/api.ts（含 interceptors）
- [ ] T019 [P] 建立 User Storage 工具：src/utils/userStorage.ts
- [ ] T020 測試 MongoDB 連接：執行 server/src/scripts/test-connection.ts
- [ ] T021 測試後端啟動：npm run server，確認無錯誤

**檢查點**: 基礎建設完成 - 可開始並行實作 User Stories

---

## Phase 3: User Story 1 - 從資料庫動態載入測驗題目 (Priority: P1) 🎯 MVP

**目標**: 使用者可從資料庫隨機抽取 20 題進行測驗

**獨立測試**: 可開始測驗並載入 20 題（1-10 單選、11-15 多選、16-20 填空）

### 後端實作

- [ ] T022 [P] [US1] 實作 Question Controller：server/src/controllers/questionController.ts
  - getQuestions (支援 random, type, limit 參數)
  - getQuestion (取得單一題目)
- [ ] T023 [US1] 實作 Questions Router：server/src/routes/questions.ts
- [ ] T024 [US1] 在 server.ts 註冊 /api/questions 路由

### 前端實作

- [ ] T025 [P] [US1] 實作 Question Service：src/services/questionService.ts
  - fetchQuestions()
  - fetchQuizQuestions() (呼叫 3 次 API 取得 10+5+5 題)
- [ ] T026 [US1] 修改 QuizPage.tsx：
  - 使用 fetchQuizQuestions() 載入題目
  - 移除硬編碼題目
  - 加入 loading 狀態顯示

### 資料遷移

- [ ] T027 [US1] 匯出現有硬編碼題目為 JSON：server/src/scripts/existing-questions.json
- [ ] T028 [US1] 建立遷移腳本：server/src/scripts/migrate-questions.ts
- [ ] T029 [US1] 執行遷移：npm run migrate:questions

**檢查點**: 使用者可從資料庫載入 20 題並進行測驗（不含提交功能）

---

## Phase 4: User Story 2 - 記錄使用者作答歷史 (Priority: P1) 🎯 MVP

**目標**: 每次測驗的作答記錄會被儲存到資料庫

**獨立測試**: 完成測驗後，可在資料庫中查詢到 Quiz 和 Answer 記錄

### 後端實作

- [ ] T030 [P] [US2] 實作 Quiz Controller：server/src/controllers/quizController.ts
  - createQuiz (建立測驗記錄)
  - submitQuiz (提交答案並計算分數，使用 Transaction)
  - getQuiz (取得測驗詳情)
  - getQuizzes (查詢測驗列表)
- [ ] T031 [US2] 實作 Quizzes Router：server/src/routes/quizzes.ts
- [ ] T032 [US2] 在 server.ts 註冊 /api/quizzes 路由
- [ ] T033 [US2] 實作答案驗證邏輯：isAnswerCorrect() 函數（處理單選/多選/填空）
- [ ] T034 [US2] 實作計分邏輯：calculateScore() 函數

### 前端實作

- [ ] T035 [P] [US2] 實作 Quiz Service：src/services/quizService.ts
  - createQuiz()
  - submitQuiz()
  - getQuiz()
- [ ] T036 [US2] 修改 QuizPage.tsx：
  - 開始測驗時呼叫 createQuiz() 建立記錄
  - 儲存 quizId 到 state
  - 提交時呼叫 submitQuiz()
- [ ] T037 [US2] 修改 ResultPage.tsx：
  - 從 API 回傳的結果顯示分數
  - 顯示錯題詳情（含正確答案）
  - 處理「題目已刪除」情況（顯示「題目已刪除」）

**檢查點**: 完成測驗後，作答記錄成功儲存，ResultPage 正確顯示分數和錯題

---

## Phase 5: User Story 3 - 管理員題庫 CRUD 功能 (Priority: P2)

**目標**: 管理員可新增、編輯、刪除題目

**獨立測試**: 可在後台管理介面對題目進行 CRUD 操作

### 後端實作

- [ ] T038 [P] [US3] 在 Question Controller 新增：
  - createQuestion (新增題目)
  - updateQuestion (編輯題目)
  - deleteQuestion (刪除題目)
- [ ] T039 [US3] 在 Questions Router 註冊 POST, PUT, DELETE 路由

### 前端實作

- [ ] T040 [P] [US3] 在 Question Service 新增：
  - createQuestion()
  - updateQuestion()
  - deleteQuestion()
- [ ] T041 [US3] 建立 QuestionBank 頁面：src/pages/QuestionBank.tsx
  - 題目列表顯示
  - 新增題目表單（支援三種題型）
  - 編輯題目表單
  - 刪除確認對話框
- [ ] T042 [US3] 在 AdminDashboard.tsx 加入「題庫管理」連結

**檢查點**: 管理員可在 QuestionBank 頁面完整管理題庫

---

## Phase 6: User Story 4 - 題目正確率統計 (Priority: P3)

**目標**: 每個題目顯示正確率和作答次數

**獨立測試**: 在題庫管理頁面可看到每題的正確率

### 後端實作

- [ ] T043 [P] [US4] 實作 Analytics Controller：server/src/controllers/analyticsController.ts
  - getQuestionStats (單一題目統計)
  - getQuestionsStats (批次查詢)
- [ ] T044 [US4] 實作 Analytics Router：server/src/routes/analytics.ts
- [ ] T045 [US4] 在 server.ts 註冊 /api/analytics 路由

### 前端實作

- [ ] T046 [P] [US4] 實作 Analytics Service：src/services/analyticsService.ts
  - getQuestionStats()
- [ ] T047 [US4] 在 QuestionBank.tsx 整合正確率顯示：
  - 每個題目顯示「正確率 XX%（答對/總作答）」
  - 無作答記錄時顯示「尚無統計資料」

**檢查點**: QuestionBank 頁面顯示每題正確率統計

---

## Phase 7: User Story 5 - 使用者得分分布統計 (Priority: P3)

**目標**: 管理員可查看得分分布圖表

**獨立測試**: 在分析頁面可看到得分分布長條圖

### 後端實作

- [ ] T048 [P] [US5] 在 Analytics Controller 新增：
  - getScoreDistribution (得分分布)
  - getAnalyticsSummary (統計摘要)

### 前端實作

- [ ] T049 [P] [US5] 在 Analytics Service 新增：
  - getScoreDistribution()
  - getAnalyticsSummary()
- [ ] T050 [US5] 建立 Analytics 頁面：src/pages/Analytics.tsx
  - 統計摘要卡片（總題數、總測驗次數、平均分數）
  - 得分分布長條圖（使用圖表庫或 CSS）
  - 書籍和難度篩選器
- [ ] T051 [US5] 在 AdminDashboard.tsx 加入「統計分析」連結

**檢查點**: Analytics 頁面完整顯示統計資訊和圖表

---

## Phase 8: 優化與跨功能改進 (Polish)

**目的**: 影響多個 User Stories 的改進

- [ ] T052 [P] 加入 API 載入狀態處理（全域 loading indicator）
- [ ] T053 [P] 加入錯誤提示 UI（Toast notifications）
- [ ] T054 程式碼清理和重構（移除未使用的程式碼）
- [ ] T055 [P] 更新 README.md 加入開發指南
- [ ] T056 [P] 更新 CLAUDE.md 加入新功能說明
- [ ] T057 執行 quickstart.md 驗證（確保所有步驟可執行）
- [ ] T058 效能優化：檢查 MongoDB 索引效能
- [ ] T059 [P] 安全性檢查：確認 .env 在 .gitignore 中

---

## 依賴關係與執行順序

### 階段依賴

- **Setup (Phase 1)**: 無依賴 - 可立即開始
- **Foundational (Phase 2)**: 依賴 Setup - **阻擋所有 User Stories**
- **User Stories (Phase 3-7)**: 全部依賴 Foundational 完成
  - User Stories 可並行執行（若有多人）
  - 或依優先級順序執行（P1 → P2 → P3）
- **Polish (Phase 8)**: 依賴所有 User Stories 完成

### User Story 依賴

- **US1 (P1)**: Foundational 完成後即可開始 - 無其他 Story 依賴
- **US2 (P1)**: Foundational 完成後即可開始 - 需整合 US1 但可獨立測試
- **US3 (P2)**: Foundational 完成後即可開始 - 獨立功能
- **US4 (P3)**: 依賴 US2（需要作答記錄） - 但可獨立測試
- **US5 (P3)**: 依賴 US2（需要測驗記錄） - 但可獨立測試

### 並行執行機會

- Setup 階段：T001-T003 可並行，T004-T010 可並行
- Foundational 階段：T012-T014 可並行，T017-T019 可並行
- US1 後端與前端實作可並行
- US3, US4, US5 在 US2 完成後可並行執行（若有多人）

---

## 實作策略

### MVP 優先（僅 US1 + US2）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational ⚠️ **關鍵阻擋點**
3. 完成 Phase 3: User Story 1
4. 完成 Phase 4: User Story 2
5. **停止並驗證**: 測試完整測驗流程（載入→作答→提交→查看結果）
6. 可部署/展示基本功能

### 漸進式交付

1. Setup + Foundational → 基礎建設完成
2. 加入 US1 → 獨立測試 → 可展示「從資料庫載入題目」
3. 加入 US2 → 獨立測試 → 可展示「完整測驗流程」（MVP!）
4. 加入 US3 → 獨立測試 → 可展示「題庫管理」
5. 加入 US4 + US5 → 獨立測試 → 可展示「統計分析」

### 並行團隊策略

多人開發時：

1. 團隊一起完成 Setup + Foundational
2. Foundational 完成後：
   - 開發者 A: US1 + US2（核心功能）
   - 開發者 B: US3（管理功能）
   - 開發者 C: US4 + US5（統計功能，需等 US2 完成）

---

## 注意事項

- [P] 標記 = 不同檔案，無依賴，可並行
- [Story] 標籤將任務對應到特定 User Story
- 每個 User Story 應可獨立完成和測試
- 每個任務或邏輯組完成後提交 git commit
- 在任何檢查點停下來驗證 Story 獨立運作
- 避免：模糊任務、同檔案衝突、破壞獨立性的跨 Story 依賴

---

## 估計時間（單人開發）

- **Phase 1 (Setup)**: 2-3 小時
- **Phase 2 (Foundational)**: 1-2 天
- **Phase 3 (US1)**: 2-3 天
- **Phase 4 (US2)**: 2-3 天
- **Phase 5 (US3)**: 2-3 天
- **Phase 6 (US4)**: 1-2 天
- **Phase 7 (US5)**: 1-2 天
- **Phase 8 (Polish)**: 1 天

**總計**: 12-18 天

**MVP (US1+US2)**: 5-8 天
