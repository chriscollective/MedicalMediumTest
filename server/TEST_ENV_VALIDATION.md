# JWT_SECRET 修復測試指南 🧪

## 測試目的

驗證 JWT_SECRET 的安全性改進是否正常運作。

---

## 測試場景

### ✅ 場景 1: 正常啟動（有效的環境變數）

**前置條件**：
- `.env` 文件存在
- `JWT_SECRET` 已設定且長度 ≥ 32 字元
- `MONGODB_URI` 已設定

**預期結果**：
```bash
$ npm run server

🔍 驗證環境變數...
  ✅ MONGODB_URI - 已設定
  ✅ JWT_SECRET - 已設定
✅ 所有環境變數驗證通過

🚀 Server running on http://localhost:5000
```

**測試方式**：
```bash
cd C:\Users\Chris\Desktop\MMQuiz
npm run server
```

---

### ❌ 場景 2: 缺少 JWT_SECRET

**前置條件**：
- 暫時重命名 `.env` 為 `.env.backup`（或刪除 `JWT_SECRET` 行）

**預期結果**：
```bash
$ npm run server

🔍 驗證環境變數...
  ✅ MONGODB_URI - 已設定
  ❌ JWT_SECRET - JWT 加密金鑰

❌ 缺少必要的環境變數：
  ❌ JWT_SECRET - JWT 加密金鑰

請在 .env 文件中設定這些變數。
參考 .env.example 檔案。

(伺服器立即終止，不會啟動)
```

**測試方式**：
```bash
# 備份 .env
mv .env .env.backup

# 嘗試啟動（應該會失敗）
npm run server

# 恢復 .env
mv .env.backup .env
```

---

### ❌ 場景 3: JWT_SECRET 太短

**前置條件**：
- `.env` 中 `JWT_SECRET=short`（少於 32 字元）

**預期結果**：
```bash
$ npm run server

🔍 驗證環境變數...
  ✅ MONGODB_URI - 已設定
  ⚠️  JWT_SECRET - 長度不足 (5 < 32 字元)

⚠️  環境變數強度不足：
  ⚠️  JWT_SECRET - 長度不足 (5 < 32 字元)

為了安全性，請使用更強的值。

(伺服器立即終止，不會啟動)
```

**測試方式**：
```bash
# 編輯 .env，暫時改為短字串
echo "JWT_SECRET=short" > .env.temp
echo "MONGODB_URI=..." >> .env.temp
mv .env .env.backup
mv .env.temp .env

# 嘗試啟動（應該會失敗）
npm run server

# 恢復 .env
mv .env.backup .env
```

---

## 生成安全的 JWT_SECRET

### 方法 1: 使用 Node.js

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

輸出範例：
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678901234567890abcdef1234567890abcd
```

### 方法 2: 使用 OpenSSL

```bash
openssl rand -base64 64
```

輸出範例：
```
XfzJ9k2L5mN8pQ1rT4vW7yB0cD3eF6gH9iJ2kL5mN8pQ1rT4vW7yB0cD3eF6gH9iJ2kL5mN8pQ==
```

### 方法 3: 線上工具

訪問 https://www.random.org/strings/ 生成 64 字元的隨機字串。

---

## 完整測試流程

### 步驟 1: 備份現有的 .env

```bash
cp .env .env.backup
```

### 步驟 2: 生成新的 JWT_SECRET

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 步驟 3: 更新 .env

複製生成的 JWT_SECRET 到 `.env` 文件。

### 步驟 4: 測試啟動

```bash
npm run server
```

應該看到：
```
🔍 驗證環境變數...
  ✅ MONGODB_URI - 已設定
  ✅ JWT_SECRET - 已設定
✅ 所有環境變數驗證通過

Connected to MongoDB Atlas successfully ✅
🚀 Server running on http://localhost:5000
```

### 步驟 5: 測試登入

```bash
# 使用 curl 測試登入 API
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

應該收到包含 token 的成功回應。

---

## 驗證清單

- [ ] 場景 1 通過：有效環境變數可正常啟動
- [ ] 場景 2 通過：缺少 JWT_SECRET 時拒絕啟動
- [ ] 場景 3 通過：JWT_SECRET 太短時拒絕啟動
- [ ] 能夠生成新的 JWT_SECRET
- [ ] 使用新 SECRET 後登入功能正常
- [ ] 舊的 token 失效（如預期）
- [ ] `.env` 已加入 `.gitignore`
- [ ] `.env.example` 已建立

---

## 常見問題

### Q: 修改後所有使用者都被登出了？

**A**: 這是正常的！
- 因為你更換了 JWT_SECRET
- 舊的 token 用舊的 SECRET 簽名，新的 SECRET 無法驗證
- 所有使用者需要重新登入
- **這是安全功能，不是 bug**

### Q: 我可以使用簡單的字串嗎？

**A**: 強烈不建議！
- 使用隨機生成的字串（至少 32 字元）
- 不要使用容易猜測的字串（如 "mysecret123"）
- 不要使用有意義的單字
- 使用上面提供的生成方法

### Q: 開發環境和生產環境可以用同一個 SECRET 嗎？

**A**: 絕對不可以！
- 開發環境和生產環境應使用不同的 SECRET
- 如果開發環境的 SECRET 外洩，不會影響生產環境
- 在 Vercel 等平台的環境變數中單獨設定生產環境的 SECRET

### Q: 多久應該更換一次 JWT_SECRET？

**A**: 建議：
- 有安全疑慮時立即更換
- 定期更換（例如每 3-6 個月）
- 開發人員離職時更換
- 更換後所有使用者需要重新登入

---

## 安全性改進總結

### ✅ 改進前的問題

```typescript
// ❌ 危險：有預設值
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';
```

**風險**：
- 如果忘記設定環境變數，使用眾所周知的預設值
- 攻擊者可以偽造任何 JWT token
- 可以以任何管理員身份登入系統

### ✅ 改進後的安全性

```typescript
// ✅ 安全：強制要求設定
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 未設定');
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET 太短');
}
```

**改進**：
- 啟動時檢查，未設定則拒絕啟動
- 檢查強度，太短則拒絕啟動
- 清楚的錯誤訊息指導如何修復
- 無法使用不安全的預設值

---

## 下一步

完成測試後，可以繼續處理其他安全性改進：

1. ✅ JWT_SECRET 修復（已完成）
2. ⏭️ 提高密碼強度要求（12 碼 + 複雜度）
3. ⏭️ 實作 Rate Limiting
4. ⏭️ 加入 Helmet 安全 Headers
5. ⏭️ 改用 HttpOnly Cookie 存 JWT

請參考 `codeReview.md` 獲得完整的安全性改進計畫。
