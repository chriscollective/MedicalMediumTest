---
name: database-operations
description: 處理 MongoDB 資料庫的各種維護操作，包括備份、還原、遷移題目、清除測驗記錄、檢查資料庫統計、重新計算排行榜。當使用者提到「備份」、「還原」、「遷移資料」、「清除資料庫」、「資料庫統計」、「排行榜重算」、「MongoDB 操作」時自動啟用此 Skill。
---

# 資料庫管理 Skill

此 Skill 協助處理醫療靈媒測驗系統的 MongoDB 資料庫維護作業。

## 🎯 使用時機

當使用者提到以下關鍵字時自動啟用：
- 「備份資料庫」、「backup」
- 「還原資料」、「restore」
- 「遷移題目」、「匯入題目」、「migrate」
- 「清除測驗記錄」、「清空資料」、「clear」
- 「檢查資料庫」、「統計」、「stats」
- 「重算排行榜」、「recalculate」

## 📋 可用操作

### 1. 備份資料庫

**指令：**
```bash
npm run backup
```

**說明：**
- 將整個 MongoDB 資料庫匯出為 JSON 檔案
- 備份檔案儲存位置會在執行後顯示
- **建議：** 在執行任何重大變更（遷移、清除）前先備份

**最佳實踐：**
- 定期備份（每週至少一次）
- 在生產環境更新前必須備份
- 保留至少 3 個歷史備份

---

### 2. 還原資料庫

**指令：**
```bash
npm run restore
```

**說明：**
- 從備份檔案還原資料庫
- 執行前會提示選擇備份檔案
- ⚠️ **警告：** 會覆蓋現有資料，請謹慎操作

**使用情境：**
- 資料損壞需要恢復
- 測試環境重置
- 誤刪資料的緊急救援

---

### 3. 遷移題目資料

**指令：**
```bash
npm run migrate:questions
```

**說明：**
- 從 `server/src/scripts/existing-questions.json` 匯入題目
- 自動處理題目格式轉換（前端 string[] → 後端 number[]）
- 避免重複匯入（檢查題目是否已存在）

**前置檢查：**
1. ✓ 確認 `.env` 中的 `MONGODB_URI` 設定正確
2. ✓ 確認題目 JSON 格式符合 Schema
3. ✓ **建議先備份資料庫**

**題目格式範例：**
```json
{
  "id": "unique-id",
  "type": "single",
  "question": "題目文字",
  "options": ["選項1", "選項2", "選項3", "選項4"],
  "correctAnswer": 0,
  "source": "369",
  "difficulty": "初階",
  "explanation": "解析內容"
}
```

---

### 4. 清除測驗記錄

**指令：**
```bash
npm run db:clear
```

**說明：**
- 清除 `quizzes` 和 `leaderboards` 集合的資料
- **保留** `questions`、`books`、`admins` 資料
- ⚠️ **不可逆操作**，執行前務必備份

**使用情境：**
- 測試環境重置
- 清除測試資料
- 系統上線前清除 Beta 測試記錄

---

### 5. 檢查資料庫統計

**指令：**
```bash
npm run db:stats
```

**說明：**
- 顯示各 Collection 的文件數量
- 檢查資料庫連線狀態
- 驗證資料完整性

**輸出範例：**
```
✓ Questions: 500 題
✓ Quizzes: 1,234 次
✓ Leaderboard: 856 筆
✓ Books: 8 本
✓ Admins: 2 位
```

---

### 6. 重新計算排行榜

**指令：**
```bash
npm run recalculate:leaderboard
```

**說明：**
- 根據現有測驗記錄重新計算排行榜
- 修正資料不一致的問題
- 更新所有排名

**使用時機：**
- 發現排行榜資料異常
- 評分規則變更後
- 資料遷移後的驗證

---

## 🔒 安全注意事項

### 環境變數檢查
執行任何資料庫操作前，確認 `.env` 檔案包含：
```env
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=development
```

### 生產環境警告
- ⚠️ 在生產環境執行清除操作前，**必須先備份**
- ⚠️ 還原操作會完全覆蓋現有資料
- ⚠️ 確認連線的是正確的資料庫（development / production）

### 權限確認
- 確保有足夠的 MongoDB 權限執行操作
- 建議使用具有完整讀寫權限的資料庫使用者

---

## 🔄 常見工作流程

### 流程 1：更新題目資料
```bash
# 1. 先備份現有資料
npm run backup

# 2. 檢查當前統計
npm run db:stats

# 3. 遷移新題目
npm run migrate:questions

# 4. 再次檢查統計（驗證）
npm run db:stats
```

### 流程 2：清除測試資料
```bash
# 1. 備份資料（以防萬一）
npm run backup

# 2. 清除測驗記錄
npm run db:clear

# 3. 確認清除結果
npm run db:stats
```

### 流程 3：資料庫重置
```bash
# 1. 選擇適當的備份檔案還原
npm run restore

# 2. 檢查還原結果
npm run db:stats

# 3. 重新計算排行榜
npm run recalculate:leaderboard
```

---

## 🛠️ 疑難排解

### 問題 1：連線失敗
**症狀：** `MongoNetworkError` 或連線超時

**解決方式：**
1. 檢查 `.env` 的 `MONGODB_URI` 是否正確
2. 確認網路連線正常
3. 檢查 MongoDB Atlas IP 白名單設定

### 問題 2：遷移資料重複
**症狀：** 題目重複出現

**解決方式：**
1. 腳本會自動檢查重複，但如果發生：
2. 檢查題目 `id` 欄位是否唯一
3. 考慮先清除後重新遷移

### 問題 3：備份檔案找不到
**症狀：** 還原時找不到備份檔案

**解決方式：**
1. 確認備份檔案路徑
2. 檢查是否有執行權限
3. 查看備份腳本輸出的檔案位置

---

## 📚 相關檔案

- **腳本目錄：** `server/src/scripts/`
- **資料模型：** `server/src/models/`
- **README：** `server/src/scripts/README.md`
- **環境設定：** `.env`

---

## ✅ 執行檢查清單

在執行任何資料庫操作前，請確認：

- [ ] `.env` 檔案設定正確
- [ ] 已連線到正確的資料庫（dev/prod）
- [ ] 了解操作的影響範圍
- [ ] **重要操作前已備份資料**
- [ ] 有足夠的磁碟空間（備份用）
- [ ] 在非高峰時段執行（生產環境）

---

**記住：資料無價，備份第一！**
