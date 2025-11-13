# Claude Skills 使用指南

此目錄包含醫療靈媒測驗系統的專案 Skills，協助 Claude Code 自動化常見任務。

## 🎯 什麼是 Skills？

Skills 是 Claude Code 的擴充功能，讓 Claude 能夠：
- **自動判斷**何時需要使用特定的專業知識
- **標準化**重複性任務的流程
- **確保一致性**（每次都用相同方式處理）
- **團隊共享**（透過 Git 同步）

## 📚 可用的 Skills

### 1. 資料庫管理（database-operations）

**用途：** 處理 MongoDB 資料庫的各種維護操作

**自動觸發關鍵字：**
- 「備份資料庫」
- 「還原資料」
- 「遷移題目」
- 「清除測驗記錄」
- 「檢查資料庫統計」
- 「重算排行榜」

**常用操作：**
```bash
npm run backup              # 備份資料庫
npm run restore             # 還原資料庫
npm run migrate:questions   # 遷移題目
npm run db:stats            # 檢查統計
npm run db:clear            # 清除測驗記錄
npm run recalculate:leaderboard  # 重算排行榜
```

**範例對話：**
```
你：我要更新題目資料
Claude：（自動觸發 database-operations skill）
        我來協助資料庫操作，首先執行備份...
```

---

### 2. UI 設計系統（ui-design-system）

**用途：** 確保所有 UI 遵循統一的自然主題設計規範

**自動觸發關鍵字：**
- 「建立新元件」
- 「設計介面」
- 「選擇顏色」
- 「UI 樣式」

**包含內容：**
- 🎨 色彩系統（鼠尾草綠 #A8CBB7、暖米金色 #E5C17A）
- 📝 字體與間距規範
- 🎭 Framer Motion 動畫範本
- 🧩 shadcn/ui 組件使用指南

**範例對話：**
```
你：我想建立一個新的卡片元件
Claude：（自動觸發 ui-design-system skill）
        我會遵循專案的自然主題設計系統，使用鼠尾草綠...
```

---

### 3. 部署前檢查（pre-deployment-check）

**用途：** 完整的部署前檢查清單，確保應用程式可以安全上線

**自動觸發關鍵字：**
- 「準備部署」
- 「要上線了」
- 「deploy」
- 「發布」

**檢查項目：**
- ✅ 環境變數設定
- ✅ 資料庫連線
- ✅ 測試通過
- ✅ 前後端建構成功
- ✅ 安全性檢查
- ✅ 效能檢查
- ✅ Git 狀態
- ✅ 資料庫備份

**範例對話：**
```
你：準備部署到生產環境
Claude：（自動觸發 pre-deployment-check skill）
        開始執行部署前檢查清單...
        ✓ 環境變數設定正確
        ✓ 資料庫連線正常
        ...
```

---

### 4. 安全性檢查（security-check）

**用途：** 防止 XSS、注入攻擊、資料洩漏等常見安全漏洞

**自動觸發關鍵字：**
- 「安全性」
- 「漏洞」
- 「XSS」
- 「注入」
- 「權限」

**檢查項目：**
- 🛡️ NoSQL 注入防護
- 🔐 JWT Token 安全
- 🚫 XSS 攻擊防護
- 🔒 敏感資料保護
- 👮 權限控制
- 🚨 CSRF 防護
- 📦 依賴套件漏洞

**範例對話：**
```
你：這個 API 有沒有安全問題？
Claude：（自動觸發 security-check skill）
        讓我檢查安全性...
        ⚠️ 發現問題：未驗證使用者權限
```

---

## 🚀 如何使用 Skills？

### 方式 1：自動觸發（推薦）

只需要**自然對話**，Claude 會自動判斷何時使用 Skill：

```
你：我要備份資料庫
Claude：（自動啟用 database-operations skill）
```

```
你：幫我建立一個新按鈕
Claude：（自動啟用 ui-design-system skill）
```

### 方式 2：明確指定（選用）

如果需要，可以明確提及 Skill：

```
你：使用 pre-deployment-check skill 檢查部署準備
```

---

## 💡 Skills 設計原則

### ✅ 這些 Skills 是「穩定的」

我們只建立**技術無關**、**長期有效**的 Skills：

| Skill | 為什麼穩定？ |
|-------|------------|
| 資料庫管理 | 不管用什麼 ORM，備份/還原概念相同 |
| UI 設計系統 | 設計規範不會因技術改變而失效 |
| 部署前檢查 | 測試、建構流程是固定的 |
| 安全性檢查 | 安全原則是通用的 |

### ❌ 我們不建立這些 Skills

**架構相關的 Skills**（可能會改變）：
- ❌ 新增頁面（綁定手動路由，可能改用 React Router）
- ❌ 狀態管理（可能換 Redux/Zustand）
- ❌ API 結構（可能換框架）

**原因：** 如果架構改變，這些 Skills 就過時了

---

## 📝 新增更多 Skills？

### 適合建立 Skill 的情況

- ✅ **重複性高**：常常做同樣的事
- ✅ **流程固定**：步驟不太會變
- ✅ **技術無關**：不依賴特定工具
- ✅ **團隊需要**：新人也要知道

### 不適合建立 Skill 的情況

- ❌ **一次性任務**：只做一次
- ❌ **架構決策**：可能會改變
- ❌ **簡單操作**：直接交代就好

### 建立新 Skill 的步驟

1. 在 `.claude/skills/` 建立新資料夾
2. 建立 `SKILL.md` 檔案（必要）
3. 加入 YAML frontmatter：
   ```yaml
   ---
   name: your-skill-name
   description: 清楚描述何時使用，包含觸發關鍵字
   ---
   ```
4. 撰寫詳細的使用說明
5. 提交到 Git（團隊自動同步）

---

## 🔄 Skills 生命週期

### 定期審查

每季度檢查：
- Skills 是否仍然適用？
- 流程是否需要更新？
- 有沒有新的重複性任務需要 Skill？

### 更新 Skills

當流程改變時，直接編輯 `SKILL.md` 並提交：

```bash
git add .claude/skills/
git commit -m "更新資料庫管理 Skill - 新增自動備份功能"
git push
```

團隊成員會自動獲得更新。

### 停用 Skills

如果 Skill 過時（例如技術棧改變），直接刪除：

```bash
rm -rf .claude/skills/outdated-skill/
git commit -m "移除過時的 Skill"
```

---

## 📚 更多資源

- **Claude Code 官方文件：** https://code.claude.com/docs
- **Skills 詳細說明：** https://code.claude.com/docs/en/skills.md
- **專案開發指南：** `CLAUDE.md`

---

## 🎓 最佳實踐

### 對開發者

1. **信任 Skills**：讓 Claude 自動觸發，不需要每次手動指定
2. **回報問題**：發現 Skill 過時或錯誤，立即更新
3. **分享知識**：發現重複性任務，考慮建立新 Skill

### 對團隊

1. **定期審查**：每季度檢視 Skills 是否需要更新
2. **保持簡潔**：只建立真正有價值的 Skills
3. **文件同步**：更新 Skill 時同步更新 README

---

**記住：Skills 是投資，短期多花時間建立，長期節省大量時間！**
