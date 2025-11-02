# 🌿 醫療靈媒隨堂測驗

> 一個精美的醫療靈媒書籍測驗應用程式，具有完整的題庫管理系統、統計分析和排行榜功能。

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)

## 📖 專案簡介

醫療靈媒隨堂測驗是一個全端測驗應用程式，專為醫療靈媒書籍讀者設計。使用者可以選擇不同書籍和難度進行測驗，系統會自動從題庫中隨機抽取 20 題，完成後提供詳細的成績分析和錯題回顧。

### ✨ 主要特色

- 🎯 **多書籍測驗系統** - 支援單本或多本書籍混合出題
- 📊 **雙難度選擇** - 初階與進階難度適合不同程度讀者
- 🎨 **精美自然風格 UI** - 採用自然主題色彩與流暢動畫效果
- 💯 **智能評分系統** - 自動計算分數並給予等級評定（S/A+/A/B+/B/C+/F）
- 📈 **統計分析儀表板** - 完整的資料視覺化與錯題分析
- 🏆 **全域排行榜** - 展示各書籍的高分玩家
- 🔐 **管理後台** - JWT 認證的安全管理系統
- 📝 **題庫管理** - 完整的 CRUD 功能管理測驗題目

## 🎬 功能展示

### 使用者端功能

- ✅ 書籍與難度選擇
- ✅ 分頁式測驗介面（每頁 5 題）
- ✅ 三種題型：單選、多選、填空
- ✅ 即時答題狀態追蹤
- ✅ 成績結算與等級評定
- ✅ 錯題回顧與詳解
- ✅ 排行榜瀏覽與成績提交

### 管理端功能

- ✅ 安全的管理員登入系統
- ✅ 題目新增、編輯、刪除
- ✅ 書籍管理（新增、啟用/停用）
- ✅ 統計資料分析
  - 累積測驗人數與次數
  - 等級分布圖表
  - 書籍參與比例
  - 錯題排行榜

## 🛠️ 技術棧

### 前端技術

- **框架**: React 18 + TypeScript
- **建構工具**: Vite 6 with SWC
- **樣式**: Tailwind CSS
- **UI 組件**: Radix UI（shadcn/ui）
- **動畫**: Framer Motion
- **圖表**: Recharts
- **HTTP 客戶端**: Axios
- **圖示**: Lucide React

### 後端技術

- **運行環境**: Node.js 20+
- **框架**: Express.js
- **資料庫**: MongoDB Atlas
- **ODM**: Mongoose
- **認證**: JWT (jsonwebtoken)
- **密碼加密**: bcrypt
- **跨域處理**: CORS

### 開發工具

- **TypeScript 執行器**: tsx
- **開發伺服器**: nodemon
- **並行執行**: concurrently

## 🚀 快速開始

### 環境需求

- Node.js 20.x 或更高版本
- npm 或 yarn
- MongoDB Atlas 帳號（或本地 MongoDB）

### 安裝步驟

1. **克隆專案**

```bash
git clone <repository-url>
cd MMQuiz
```

2. **安裝依賴**

```bash
npm install
```

3. **環境變數設定**

複製環境變數範例檔案：

```bash
cp .env.example .env
```

編輯 `.env` 並填入您的設定：

```bash
# MongoDB Atlas 連線字串
MONGODB_URI=your url.

# 後端伺服器端口
PORT=5000
NODE_ENV=development

# 前端 API 位址
VITE_API_URL=http://localhost:5000/api
```

4. **初始化資料庫**

建立預設管理員帳號（後端首次啟動時會自動執行）：

```bash
npm run server
```

或手動執行腳本：

```bash
tsx server/src/scripts/seed-admin.ts
```

5. **匯入題目資料（可選）**

如果您有現成的題目資料：

```bash
npm run migrate:questions
```

### 啟動應用程式

**方式一：同時啟動前後端（推薦）**

```bash
npm run dev:all
```

**方式二：分別啟動**

```bash
# 終端機 1 - 啟動後端
npm run server

# 終端機 2 - 啟動前端
npm run dev
```

應用程式將在以下位址運行：

- 🎨 前端: http://localhost:5173
- 🔌 後端 API: http://localhost:5000
- 🏥 健康檢查: http://localhost:5000/api/health

## 📁 專案結構

```
MMQuiz/
├── src/                          # 前端原始碼
│   ├── components/               # React 組件
│   │   ├── ui/                  # shadcn/ui 基礎組件
│   │   ├── QuestionCard.tsx     # 題目卡片組件
│   │   ├── QuizProgress.tsx     # 測驗進度條
│   │   └── NatureAccents.tsx    # 自然風格裝飾元素
│   ├── pages/                    # 頁面組件
│   │   ├── LandingPage.tsx      # 首頁（選擇書籍與難度）
│   │   ├── QuizPage.tsx         # 測驗頁面
│   │   ├── ResultPage.tsx       # 成績結果頁
│   │   ├── Leaderboard.tsx      # 排行榜
│   │   ├── AdminLogin.tsx       # 管理員登入
│   │   ├── AdminDashboard.tsx   # 管理控制台
│   │   ├── Analytics.tsx        # 統計分析
│   │   └── QuestionBank.tsx     # 題庫管理
│   ├── services/                 # API 服務層
│   │   ├── api.ts               # Axios 實例
│   │   ├── authService.ts       # 認證服務
│   │   ├── questionService.ts   # 題目服務
│   │   ├── quizService.ts       # 測驗服務
│   │   ├── analyticsService.ts  # 統計服務
│   │   ├── leaderboardService.ts # 排行榜服務
│   │   └── bookService.ts       # 書籍服務
│   ├── data/                     # 靜態資料
│   ├── types/                    # TypeScript 類型定義
│   ├── utils/                    # 工具函數
│   ├── constants/                # 常數定義
│   └── App.tsx                   # 主應用程式組件
│
├── server/                       # 後端原始碼
│   ├── src/
│   │   ├── config/              # 設定檔（資料庫連線）
│   │   ├── models/              # Mongoose 資料模型
│   │   │   ├── Question.ts      # 題目模型
│   │   │   ├── Quiz.ts          # 測驗記錄模型
│   │   │   ├── Leaderboard.ts   # 排行榜模型
│   │   │   ├── Admin.ts         # 管理員模型
│   │   │   └── Book.ts          # 書籍模型
│   │   ├── controllers/         # 控制器（業務邏輯）
│   │   ├── routes/              # API 路由定義
│   │   ├── middleware/          # 中間件（認證、錯誤處理）
│   │   ├── scripts/             # 資料庫工具腳本
│   │   └── server.ts            # Express 伺服器入口
│   └── tsconfig.json
│
├── public/                       # 靜態資源
├── .env.example                  # 環境變數範例
├── package.json                  # 專案依賴與腳本
├── vite.config.ts               # Vite 設定
├── tailwind.config.js           # Tailwind CSS 設定
├── CLAUDE.md                     # AI 開發指南
└── README.md                     # 專案說明文件
```

## 🔌 API 端點

### 基礎路由

```
基礎 URL: http://localhost:5000/api
```

### 公開端點

| 方法 | 端點                  | 說明                     |
| ---- | --------------------- | ------------------------ |
| GET  | `/health`             | 伺服器健康檢查           |
| GET  | `/questions`          | 取得題目列表（支援篩選） |
| POST | `/quizzes`            | 建立新測驗記錄           |
| POST | `/quizzes/:id/submit` | 提交測驗答案             |
| GET  | `/leaderboard`        | 取得排行榜資料           |
| POST | `/leaderboard`        | 提交成績到排行榜         |
| GET  | `/books`              | 取得書籍列表             |

### 統計端點

| 方法 | 端點                            | 說明         |
| ---- | ------------------------------- | ------------ |
| GET  | `/analytics/summary`            | 統計摘要     |
| GET  | `/analytics/grade-distribution` | 等級分布資料 |
| GET  | `/analytics/book-distribution`  | 書籍參與比例 |
| GET  | `/analytics/wrong-questions`    | 錯題排行榜   |

### 管理端點（需要認證）

| 方法   | 端點             | 說明       |
| ------ | ---------------- | ---------- |
| POST   | `/admin/login`   | 管理員登入 |
| POST   | `/admin/logout`  | 管理員登出 |
| POST   | `/questions`     | 新增題目   |
| PUT    | `/questions/:id` | 更新題目   |
| DELETE | `/questions/:id` | 刪除題目   |
| POST   | `/books`         | 新增書籍   |
| PUT    | `/books/:id`     | 更新書籍   |

## 📜 可用腳本

### 開發環境

```bash
# 同時啟動前端和後端（推薦）
npm run dev:all

# 僅啟動前端開發伺服器
npm run dev

# 僅啟動後端開發伺服器（支援熱重載）
npm run server
```

### 生產環境

```bash
# 建構前端
npm run build

# 建構後端
npm run server:build

# 啟動生產版後端
npm run server:start
```

### 資料庫工具

```bash
# 遷移題目資料
npm run migrate:questions
```

## 💾 資料庫結構

### Collections 說明

#### questions（題目）

儲存所有測驗題目，包含三種題型。

#### quizzes（測驗記錄）

記錄每次測驗的詳細資訊，包含答題狀態、成績等。

#### leaderboards（排行榜）

儲存玩家的最佳成績，用於全域排行榜顯示。

#### admins（管理員）

管理員帳號資訊，密碼使用 bcrypt 加密。

#### books（書籍）

可測驗的書籍列表及其啟用狀態。

詳細欄位說明請參考 [CLAUDE.md](./CLAUDE.md#資料庫架構)。

## 🎨 設計原則

本專案採用自然療癒風格設計：

- **色彩方案**

  - 主色：鼠尾草綠 (#A8CBB7)
  - 強調色：暖米金 (#E5C17A)
  - 背景：灰白 (#FAFAF7)
  - 次要色：淺奶油 (#F7E6C3)

- **動畫效果**

  - 使用 Framer Motion 實現流暢轉場
  - 頁面切換具有方向性動畫
  - 交錯式列表載入效果

- **使用者體驗**
  - 響應式設計，支援各種螢幕尺寸
  - 清晰的視覺回饋
  - 無障礙設計（使用 Radix UI）

## 🔐 安全性

- ✅ JWT Token 認證機制
- ✅ 密碼使用 bcrypt 加密儲存
- ✅ CORS 跨域保護
- ✅ 環境變數保護敏感資訊
- ✅ API 請求驗證與錯誤處理

## 🚢 部署指南

### 前端部署（推薦 Vercel 或 Netlify）

1. 建構前端：

```bash
npm run build
```

2. 設定環境變數：

```
VITE_API_URL=https://your-backend-api.com/api
```

3. 部署 `dist` 目錄

### 後端部署（推薦 Railway、Render 或 Heroku）

1. 建構後端：

```bash
npm run server:build
```

2. 設定環境變數：

```
MONGODB_URI=<your-mongodb-atlas-uri>
PORT=5000
NODE_ENV=production
JWT_SECRET=<your-secret-key>
```

3. 啟動命令：

```bash
npm run server:start
```

## 📝 開發指南

### 新增題目

1. 登入管理後台
2. 進入「題目管理」
3. 點擊「新增題目」
4. 填寫題目資訊並選擇題型
5. 設定正確答案與解析

### 新增書籍

1. 登入管理後台
2. 進入「書籍管理」
3. 點擊「新增書籍」
4. 填寫書籍名稱與顯示名稱

### 自訂等級評分標準

編輯 `src/utils/gradeCalculator.ts` 或相關檔案來調整評分邏輯。

## 🐛 常見問題

**Q: 無法連線到 MongoDB？**
A: 請確認 `.env` 中的 `MONGODB_URI` 設定正確，且 MongoDB Atlas 已允許您的 IP 位址連線。

**Q: 前端無法呼叫後端 API？**
A: 檢查 `VITE_API_URL` 環境變數是否正確設定，確保後端伺服器已啟動。

**Q: 忘記管理員密碼？**
A: 執行 `tsx server/src/scripts/reset-admin.ts` 重設管理員密碼。

**Q: 題目不足 20 題無法開始測驗？**
A: 請確保資料庫中對應書籍與難度的題目數量至少有 20 題。

## 📄 授權

本專案採用 MIT 授權條款。詳見 [LICENSE](./LICENSE) 檔案。

## 🙏 致謝

- 設計稿來源：[Figma 設計檔](https://www.figma.com/design/a3i2fvV92IFl19Lom9aKXH/醫療靈媒隨堂測驗介面設計)
- UI 組件：[shadcn/ui](https://ui.shadcn.com/)
- 圖示：[Lucide Icons](https://lucide.dev/)

## 📞 聯絡方式

如有任何問題或建議，歡迎開啟 Issue 或 Pull Request！

---

⭐ 如果這個專案對您有幫助，請給個星星支持我們！
