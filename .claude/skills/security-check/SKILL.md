---
name: security-check
description: 程式碼安全性檢查，防止 XSS、SQL/NoSQL 注入、CSRF、資料洩漏等常見安全漏洞。當開發新功能、處理使用者輸入、實作 API 或審查程式碼時使用。關鍵字：安全、漏洞、XSS、注入、CSRF、資料洩漏、security
---

# 安全性檢查 Skill

此 Skill 提供**全面的安全性檢查清單**，防止常見的 Web 應用程式安全漏洞。

## 🎯 使用時機

當：
- 實作使用者輸入功能（表單、搜尋）
- 建立新的 API 端點
- 處理敏感資料（密碼、個資）
- 實作認證/授權功能
- 程式碼審查
- 準備上線前的安全檢查

## 🛡️ OWASP Top 10 檢查清單

### 1. 注入攻擊（Injection）

#### NoSQL 注入防護 ✅

**問題：** MongoDB 查詢可能被惡意輸入污染

**錯誤範例：**
```typescript
// ✗ 危險！直接使用使用者輸入
app.get('/api/users', (req, res) => {
  const query = { username: req.query.username };
  User.find(query);  // 可被注入：?username[$ne]=null
});
```

**正確範例：**
```typescript
// ✓ 使用 express-mongo-sanitize
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());

// ✓ 明確驗證輸入型別
app.get('/api/users', (req, res) => {
  const username = String(req.query.username || '');
  if (typeof username !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  User.find({ username });
});
```

**專案檢查：**
```bash
# 確認 server/src/server.ts 包含：
grep "mongoSanitize" server/src/server.ts
```

---

### 2. 身份驗證漏洞（Broken Authentication）

#### JWT Token 安全 ✅

**問題：** 弱密鑰、Token 洩漏、無過期時間

**檢查項目：**

1. **強密鑰**
```typescript
// ✗ 危險！弱密鑰
const JWT_SECRET = '12345';

// ✓ 安全：強隨機密鑰（環境變數）
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
```

2. **Token 過期時間**
```typescript
// ✓ 設定合理的過期時間
const token = jwt.sign(
  { userId: user._id },
  JWT_SECRET,
  { expiresIn: '24h' }  // 24 小時過期
);
```

3. **Token 儲存**
```typescript
// ✓ 使用 httpOnly cookie（防 XSS）
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000  // 24 小時
});

// ⚠️ localStorage 較不安全（容易 XSS），但專案使用此方式
// 如使用 localStorage，務必防範 XSS
```

---

#### 密碼安全 ✅

**檢查項目：**

1. **使用 bcrypt 加密**
```typescript
import bcrypt from 'bcrypt';

// ✓ 加密密碼
const hashedPassword = await bcrypt.hash(password, 10);

// ✓ 驗證密碼
const isValid = await bcrypt.compare(password, hashedPassword);
```

2. **密碼強度要求**
```typescript
// ✓ 驗證密碼強度
function validatePassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&  // 至少一個大寫
    /[a-z]/.test(password) &&  // 至少一個小寫
    /[0-9]/.test(password)     // 至少一個數字
  );
}
```

**專案檢查：**
```bash
# 確認使用 bcrypt
grep "bcrypt" server/src/models/Admin.ts
```

---

### 3. 敏感資料洩漏（Sensitive Data Exposure）

#### 環境變數保護 ✅

**檢查項目：**

1. **不要提交 .env 到 Git**
```bash
# 檢查 .gitignore
grep "^\.env$" .gitignore || echo "⚠️ 警告：.env 未被忽略！"

# 確認 .env 未被追蹤
git ls-files | grep "^\.env$" && echo "⚠️ 危險：.env 已被提交！"
```

2. **不要在前端洩漏敏感資訊**
```typescript
// ✗ 危險！洩漏 API 密鑰
const API_KEY = 'sk-1234567890abcdef';

// ✓ 使用後端代理
// 前端只知道自己的 API 端點，不知道第三方密鑰
```

3. **檢查建構產物**
```bash
# 確認前端建構產物中無敏感資訊
grep -r "mongodb+srv" dist/ && echo "⚠️ 危險：資料庫連線洩漏！"
grep -r "JWT_SECRET" dist/ && echo "⚠️ 危險：JWT 密鑰洩漏！"
```

---

#### API 回應安全 ✅

**錯誤範例：**
```typescript
// ✗ 洩漏過多資訊
res.status(500).json({
  error: 'Database error',
  details: err.stack,  // 洩漏伺服器路徑
  query: sql           // 洩漏資料庫結構
});
```

**正確範例：**
```typescript
// ✓ 生產環境隱藏細節
res.status(500).json({
  error: 'Internal server error',
  ...(process.env.NODE_ENV === 'development' && { details: err.message })
});
```

---

### 4. XSS 攻擊（Cross-Site Scripting）

#### React 自動保護 ✅

React 預設會轉義輸出，防止 XSS：

```typescript
// ✓ 安全：React 自動轉義
<div>{userInput}</div>

// ✗ 危險：繞過 React 保護
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**檢查項目：**

1. **避免 dangerouslySetInnerHTML**
```bash
# 搜尋危險用法
grep -r "dangerouslySetInnerHTML" src/
```

2. **驗證使用者輸入**
```typescript
// ✓ 清理 HTML 標籤
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

### 5. 權限控制（Broken Access Control）

#### API 權限檢查 ✅

**錯誤範例：**
```typescript
// ✗ 危險！僅前端檢查
app.delete('/api/questions/:id', (req, res) => {
  // 任何人都能刪除！
  Question.findByIdAndDelete(req.params.id);
});
```

**正確範例：**
```typescript
// ✓ 後端驗證管理員權限
import { authenticateToken } from '../middleware/auth';

app.delete('/api/questions/:id', authenticateToken, async (req, res) => {
  // 確認是管理員
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await Question.findByIdAndDelete(req.params.id);
});
```

**專案檢查：**
```bash
# 確認敏感 API 有權限檢查
grep -A 5 "router.delete\|router.post\|router.put" server/src/routes/questions.ts
```

---

### 6. CSRF 攻擊（Cross-Site Request Forgery）

#### SameSite Cookie ✅

```typescript
// ✓ 設定 SameSite 防止 CSRF
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'  // 防止跨站請求
});
```

#### CORS 設定 ✅

**檢查 server/src/server.ts：**

```typescript
// ✓ 生產環境限制來源
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✗ 不要在生產環境使用：
// app.use(cors({ origin: '*' }));
```

---

### 7. 速率限制（Rate Limiting）

#### 防止暴力破解 ✅

```typescript
import rateLimit from 'express-rate-limit';

// ✓ 登入 API 限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 分鐘
  max: 5,                    // 最多 5 次嘗試
  message: '嘗試次數過多，請 15 分鐘後再試'
});

app.post('/api/admin/login', loginLimiter, loginHandler);
```

**專案檢查：**
```bash
# 確認已安裝 rate limiter
grep "express-rate-limit" package.json
```

---

### 8. 依賴套件漏洞

#### 定期檢查 ✅

```bash
# 檢查已知漏洞
npm audit

# 自動修復
npm audit fix

# 檢查過期套件
npx npm-check-updates
```

**處理優先級：**
- 🔴 **Critical**：立即修復
- 🟠 **High**：盡快修復
- 🟡 **Moderate**：評估後決定
- 🟢 **Low**：關注即可

---

## 🔍 安全檢查實用指令

### 1. 搜尋敏感資訊洩漏

```bash
# 搜尋硬編碼的密碼/密鑰
grep -r -i "password.*=.*['\"]" --include="*.ts" --include="*.tsx" src/ server/
grep -r -i "apikey\|api_key\|secret" --include="*.ts" src/ server/

# 搜尋註解掉的敏感資訊
grep -r "//.*password\|//.*secret" src/ server/
```

### 2. 搜尋危險函數

```bash
# React dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" src/

# eval() 使用
grep -r "eval(" src/ server/

# 動態 require
grep -r "require(.*\+" server/
```

### 3. 檢查 HTTP Header 安全

```bash
# 確認使用 helmet（Node.js）
grep "helmet" server/src/server.ts
```

如未使用，建議加入：
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## ✅ 安全檢查清單

開發新功能時，請確認：

### 輸入驗證
- [ ] 所有使用者輸入都經過驗證
- [ ] 使用 TypeScript 型別檢查
- [ ] 長度限制（防止過長輸入）
- [ ] 格式驗證（email、URL、數字）

### 認證授權
- [ ] 敏感 API 有權限檢查
- [ ] JWT Token 有過期時間
- [ ] 密碼使用 bcrypt 加密
- [ ] 登入有速率限制

### 資料保護
- [ ] `.env` 不在 Git 中
- [ ] 建構產物無敏感資訊
- [ ] API 錯誤訊息不洩漏細節
- [ ] HTTPS（生產環境）

### 注入防護
- [ ] 使用 express-mongo-sanitize
- [ ] 明確驗證輸入型別
- [ ] 不使用動態查詢

### XSS 防護
- [ ] 不使用 dangerouslySetInnerHTML
- [ ] 清理使用者輸入
- [ ] 使用 Content Security Policy（CSP）

### CSRF 防護
- [ ] CORS 正確設定
- [ ] Cookie 使用 SameSite
- [ ] 敏感操作需要 CSRF Token

### 其他
- [ ] 依賴套件無高危漏洞
- [ ] 使用 helmet 設定安全 Header
- [ ] 速率限制已設定
- [ ] 日誌不記錄敏感資訊

---

## 📚 安全資源

- **OWASP Top 10：** https://owasp.org/www-project-top-ten/
- **OWASP Cheat Sheets：** https://cheatsheetseries.owasp.org/
- **Node.js 安全指南：** https://nodejs.org/en/docs/guides/security/
- **MongoDB 安全：** https://www.mongodb.com/docs/manual/security/

---

## 🚨 發現漏洞怎麼辦？

1. **立即修復高危漏洞**
2. **記錄漏洞詳情**（但不公開）
3. **更新相關測試**
4. **審查類似問題**
5. **學習防範方法**

---

**記住：安全是持續的過程，不是一次性的檢查！**
