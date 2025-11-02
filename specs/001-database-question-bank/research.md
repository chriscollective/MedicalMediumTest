# Research: 資料庫題庫系統與分析功能

**Date**: 2025-10-30
**Feature**: 001-database-question-bank

## 技術決策總結

本文件記錄 Phase 0 研究階段的技術選型決策和理由。

---

## Decision 1: 資料庫方案

**選擇**: Express + MongoDB Atlas

**理由**:

1. **安全性**: 前端直接連接資料庫會暴露連接字串和憑證
2. **存取控制**: 需要後端 API 層實作管理員權限驗證
3. **資料驗證**: 後端可進行深度資料驗證和業務邏輯處理
4. **MongoDB Atlas**: 雲端托管，免費方案足夠使用，無需本地安裝維護

**替代方案考慮**:

- **localStorage/IndexedDB**: 無法實現題庫集中管理和跨裝置同步
- **Supabase/Firebase**: 雖簡單但增加第三方依賴，團隊更熟悉 Express + MongoDB 技術棧
- **SQLite**: 需要檔案系統存取，不適合瀏覽器環境

---

## Decision 2: 專案結構

**選擇**: 單一專案根目錄，前後端共存

**理由**:

1. **符合憲章**: 維持單體架構原則
2. **簡化部署**: 單一 git 儲存庫，單一部署流程
3. **共用配置**: package.json、.gitignore、環境變數統一管理
4. **開發便利**: 前後端程式碼在同一專案中，方便查看和修改

**實作方式**:

```
- src/ (前端)
- server/ (後端)
- package.json (共用)
```

**替代方案考慮**:

- **分離的 frontend/ 和 backend/**: 清晰但違反單體原則
- **前端為主，Express 嵌入**: 可能造成路由衝突和配置複雜

---

## Decision 3: MongoDB 部署方式

**選擇**: MongoDB Atlas 雲端免費方案

**理由**:

1. **零安裝**: 無需本地安裝和配置 MongoDB
2. **免費額度**: 512MB 儲存空間足夠初期使用（~1000 題 + 10000 筆記錄）
3. **自動備份**: Atlas 提供自動備份功能
4. **易於擴展**: 未來可無縫升級到付費方案

**配置需求**:

- Connection String: `mongodb+srv://<username>:<password>@cluster.mongodb.net/mmquiz`
- 儲存於 `.env` 檔案
- 使用 Mongoose 作為 ODM

**替代方案考慮**:

- **本地 MongoDB**: 需要安裝、維護、備份
- **Docker MongoDB**: 需要學習 Docker，增加開發複雜度

---

## Decision 4: API 通訊方式

**選擇**: Axios + RESTful API

**理由**:

1. **Axios 優勢**:
   - 自動 JSON 轉換
   - 更好的錯誤處理
   - Interceptors 支援（可加入全域錯誤處理）
   - 請求/回應攔截器
2. **RESTful 設計**:
   - 標準化且直觀
   - 符合 HTTP 語意
   - 易於理解和維護

**API 設計模式**:

```typescript
GET    /api/questions?book=XXX&difficulty=XXX&type=single&limit=10
POST   /api/questions
PUT    /api/questions/:id
DELETE /api/questions/:id

POST   /api/quizzes        # 開始測驗
POST   /api/quizzes/:id/submit   # 提交測驗

GET    /api/analytics/questions/:id  # 題目統計
GET    /api/analytics/score-distribution  # 得分分布
```

**替代方案考慮**:

- **Fetch API**: 簡單但錯誤處理較弱
- **React Query**: 功能強大但過度工程，不符合簡單優先原則

---

## Decision 5: 開發環境設置

**選擇**: Vite proxy + 分別啟動前後端

**理由**:

1. **Vite proxy 配置**:
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true
       }
     }
   }
   ```
2. **開發流程**:

   - Terminal 1: `npm run dev` (Vite on :3000)
   - Terminal 2: `npm run server` (Express on :5000)
   - 或使用 concurrently: `npm run dev:all`

3. **生產環境**:
   - Vite build → `dist/`
   - Express 服務 `dist/` 靜態檔案
   - 單一端口 (5000)

**替代方案考慮**:

- **Express 嵌入 Vite**: 配置複雜，可能影響 HMR
- **完全分離部署**: 需要處理 CORS，違反單體原則

---

## 依賴套件清單

### 前端新增依賴

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0"
  }
}
```

### 後端新增依賴

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "nodemon": "^3.0.0",
    "concurrently": "^8.0.0"
  }
}
```

---

## 環境變數設計

`.env` 檔案內容：

```bash
# MongoDB
MONGODB_URI=

# Server
PORT=5000
NODE_ENV=development

# Frontend (開發時由 Vite 使用)
VITE_API_URL=http://localhost:5000/api
```

`.env.example`

```bash
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
```

---

## 最佳實踐參考

### Express + TypeScript 結構

參考: [Express TypeScript Boilerplate](https://github.com/microsoft/TypeScript-Node-Starter)

- Controllers 模式
- 錯誤處理中介軟體
- 環境變數管理

### Mongoose Schema 設計

參考: [Mongoose Best Practices](https://mongoosejs.com/docs/guide.html)

- Schema 驗證
- Virtual properties
- Timestamps 自動管理

### React + Axios 整合

參考: [Axios Best Practices](https://axios-http.com/docs/intro)

- 建立 Axios 實例
- 全域錯誤攔截器
- Request/Response 型別定義

---

## 風險與緩解措施

### 風險 1: CORS 問題

**緩解**:

- 開發環境使用 Vite proxy
- 生產環境 Express 同源服務前端
- 必要時配置 cors middleware

### 風險 2: MongoDB 連接失敗

**緩解**:

- 啟動時檢查連接
- 友善錯誤訊息
- 自動重連機制（Mongoose 內建）

### 風險 3: 資料庫憑證洩漏

**緩解**:

- `.env` 加入 `.gitignore`
- 提供 `.env.example` 範例
- README 說明如何設定

### 風險 4: 前後端型別不一致

**緩解**:

- 共用 TypeScript 介面定義
- 建立 `src/types/` 目錄
- 前後端都使用相同型別檔案

---

## 下一步：Phase 1

已解決所有 NEEDS CLARIFICATION。可進入 Phase 1 設計階段：

1. 產生 `data-model.md`（資料模型）
2. 產生 `contracts/` (API 規格)
3. 產生 `quickstart.md`（開發指南）
