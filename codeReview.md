# 專案代碼審查報告 📊

**審查日期**: 2025-01-07
**專案名稱**: 醫療靈媒測驗應用程式（MMQuiz）
**技術棧**: React + TypeScript + Vite / Node.js + Express + MongoDB

---

## 📈 1. 已完成的優化

### 1.1 使用者體驗優化

#### ✅ MM 稱號和語錄系統
- **位置**: `src/data/mmContent.ts`, `src/pages/ResultPage.tsx`
- **優化內容**:
  - 根據測驗成績（S/A+/A/B+/B/C+/F）顯示對應的 MM 稱號
  - 隨機顯示療癒語錄（14 條），使用 `useMemo` 確保每次測驗結果頁只選擇一次
  - 美化的卡片展示，搭配引號裝飾
- **影響**: 提升使用者成就感和參與度

#### ✅ GradeBadge 視覺優化
- **位置**: `src/components/GradeBadge.tsx:31-62`
- **優化內容**:
  - 從 Tailwind 類別改為 inline style 實作
  - 使用 `React.CSSProperties` 確保漸變色、陰影、動畫 100% 生效
  - 不受 Tailwind JIT 編譯問題影響
- **技術細節**: 針對 A 級使用 `#f1f09a` 漸變色，確保視覺一致性
- **影響**: 解決了顏色失效問題，提升品牌視覺一致性

#### ✅ 按鈕 Hover 效果優化
- **位置**: `src/pages/ReportManagement.tsx:287-337`
- **優化內容**:
  - 使用 React 狀態 (`hoveredButton`) + inline style 實作 hover
  - 眼睛、勾勾、垃圾桶按鈕都有明顯的背景色變化、放大效果、陰影
  - 將圖示從 16px 放大到 24px，提升可點擊性
- **影響**: 改善管理後台的互動體驗

### 1.2 功能完善

#### ✅ 問題回報系統
- **前端**: `src/components/ReportIssueDialog.tsx`, `src/pages/ReportManagement.tsx`
- **後端**: `server/src/models/Report.ts`, `server/src/controllers/reportController.ts`
- **功能**:
  - 使用者可回報題目錯誤（書籍、題型、內容、問題描述）
  - 管理員可查看、篩選（全部/待處理/已完成）、標記完成、刪除
  - 詳細對話框顯示完整資訊
  - 已完成的項目會顯示劃線效果
- **資料庫**: MongoDB 持久化儲存，支援狀態管理和時間戳記

#### ✅ 真正的刪除功能
- **位置**: `server/src/controllers/reportController.ts:109-141`
- **優化內容**:
  - 使用 `Report.findByIdAndDelete()` 真正從資料庫刪除
  - 先檢查記錄是否存在（404 處理）
  - Console 記錄刪除操作（書籍、題型、ID）
  - 前端確認對話框警告「永久刪除」
- **影響**: 避免資料庫累積垃圾資料

### 1.3 技術債務處理

#### ✅ CORS 設定修復
- **位置**: `server/src/server.ts:42`
- **修復內容**: 添加 `PATCH` 方法到允許列表
- **修復前**: 更新問題回報狀態失敗（CORS 阻擋）
- **修復後**: PATCH 請求正常運作
- **相關**: `methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]`

#### ✅ Tailwind 問題識別與文檔化
- **文檔**: `remind.md`, `PROJECT_SETUP_SOP.md`
- **識別問題**:
  - Tailwind 未正確啟用動態編譯
  - 缺少 `postcss.config.js`
  - `src/index.css` 是靜態的舊編譯結果（4152 行）
- **解決方案**: 使用 inline style 替代不穩定的 Tailwind 類別
- **影響**: 建立 SOP 防止未來專案重蹈覆轍

### 1.4 安全性優化（已實作）

#### ✅ 登入失敗鎖定機制
- **位置**: `server/src/models/Admin.ts:98-121`
- **機制**:
  - 5 次登入失敗後鎖定帳號 15 分鐘
  - 鎖定期間顯示剩餘時間
  - 成功登入後重置嘗試次數
- **影響**: 防止暴力破解攻擊

#### ✅ 密碼加密
- **位置**: `server/src/models/Admin.ts:72-84`
- **實作**: 使用 bcrypt (salt rounds = 10) pre-save hook 自動加密
- **影響**: 資料庫不存明文密碼

#### ✅ 輸入驗證
- **位置**: `server/src/controllers/questionController.ts:4-140`
- **驗證項目**:
  - 題目類型、選項數量、答案格式
  - 索引範圍檢查
  - 資料類型轉換與驗證
  - 空值處理
- **影響**: 防止無效資料進入資料庫

---

## 🔧 2. 可以優化的部分

### 2.1 效能優化

#### 🔄 前端效能

**問題 1: 缺少 Code Splitting**
```typescript
// 現狀：所有頁面都在 App.tsx 中直接 import
import { QuizPage } from "./pages/QuizPage";
import { Analytics } from "./pages/Analytics";
import { QuestionBank } from "./pages/QuestionBank";
// ... 等 10+ 個頁面

// 建議：使用 React.lazy 動態載入
const QuizPage = lazy(() => import("./pages/QuizPage"));
const Analytics = lazy(() => import("./pages/Analytics"));
```

**影響**:
- 初始包大小：1.34 MB (minified)
- 建議拆分後：首頁 ~200KB，其他按需載入
- **預期改善**: 首次載入速度提升 60-70%

**問題 2: 圖片未優化**
```typescript
// src/pages/About.tsx:32
backgroundImage: "url('https://images.unsplash.com/photo-...?w=1080')"
```

**建議**:
- 使用 WebP 格式
- 實作 lazy loading
- 根據裝置提供不同尺寸 (srcset)
- 考慮使用 CDN

**問題 3: 缺少 Memoization**
```typescript
// src/pages/ReportManagement.tsx:111-116
const filteredReports = reports.filter((report) => {
  if (filter === "all") return true;
  // ... 每次 render 都重新計算
});
```

**建議**: 使用 `useMemo`
```typescript
const filteredReports = useMemo(() => {
  return reports.filter((report) => {
    if (filter === "all") return true;
    // ...
  });
}, [reports, filter]);
```

#### 🔄 後端效能

**問題 4: 缺少資料庫索引**

```javascript
// server/src/models/Question.ts
// 建議添加複合索引
questionSchema.index({ source: 1, difficulty: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ createdAt: -1 });

// server/src/models/Quiz.ts
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ book: 1, grade: 1 });

// server/src/models/Report.ts
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ bookName: 1, status: 1 });
```

**影響**: 查詢速度可提升 10-100 倍（資料量大時）

**問題 5: N+1 查詢問題**
```typescript
// 若未來有關聯查詢，建議使用 populate 或 aggregate
// 避免在迴圈中查詢資料庫
```

**問題 6: 缺少 API Response 快取**
```typescript
// 建議：對不常變動的資料加上快取
// 例如：書籍列表、題目統計等
import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 300 }); // 5 分鐘
```

### 2.2 代碼品質

#### 🔄 錯誤處理統一

**問題 7: 錯誤訊息不一致**
```typescript
// 有些用 alert，有些用 console.error
// src/pages/ReportManagement.tsx:62
alert("載入失敗，請重新整理頁面");

// src/pages/ReportManagement.tsx:84
alert("更新失敗，請稍後再試");
```

**建議**: 建立統一的 Toast 通知系統
```typescript
// utils/toast.ts
import { toast } from "sonner"; // 已安裝

export const showError = (message: string) => toast.error(message);
export const showSuccess = (message: string) => toast.success(message);
export const showWarning = (message: string) => toast.warning(message);
```

**問題 8: API Response 格式不統一**
```typescript
// 有些回傳 { success, data, message }
// 有些直接回傳 data
// 建議統一為：
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

#### 🔄 TypeScript 改善

**問題 9: 使用 `any` 類型**
```typescript
// server/src/controllers/reportController.ts:53
const filter: any = {};

// 建議改為
interface ReportFilter {
  status?: string;
  bookName?: string;
}
const filter: ReportFilter = {};
```

**問題 10: 缺少嚴格的 Type Guards**
```typescript
// src/services/authService.ts:95
return JSON.parse(userStr);

// 建議加上驗證
const parsed = JSON.parse(userStr);
if (parsed && typeof parsed.id === "string" && typeof parsed.username === "string") {
  return parsed as AdminUser;
}
return null;
```

### 2.3 使用者體驗

#### 🔄 載入狀態

**問題 11: 缺少骨架屏 (Skeleton)**
```typescript
// src/pages/ReportManagement.tsx:218-222
{loading ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 text-[#A8CBB7] animate-spin" />
  </div>
) : ...}
```

**建議**: 使用 Skeleton UI 提升體驗
```typescript
{loading ? (
  <div className="space-y-3">
    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
  </div>
) : ...}
```

#### 🔄 錯誤邊界

**問題 12: 缺少 Error Boundary**
```typescript
// 建議在 App.tsx 加上
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>發生錯誤：</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重試</button>
    </div>
  );
}

// 包裹整個應用
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

### 2.4 開發體驗

#### 🔄 環境變數管理

**問題 13: 缺少 `.env.example`**
```bash
# 建議建立 .env.example
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
```

**問題 14: 環境變數驗證**
```typescript
// server/src/server.ts
// 建議在啟動時驗證必要的環境變數
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

---

## 🐛 3. 潛在錯誤

### 3.1 邏輯錯誤

#### ⚠️ 錯誤 1: localStorage 競態條件
**位置**: `src/services/authService.ts:112-115`
```typescript
// 問題：在模組載入時立即執行
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
```

**風險**:
- 如果 localStorage 還未載入，token 可能為 null
- 多個 tab 同時登出時可能產生不一致狀態

**建議**: 改為在 App 組件初始化時執行

#### ⚠️ 錯誤 2: 未處理的 Promise Rejection
**位置**: 多處 async 函數
```typescript
// src/pages/ReportManagement.tsx:95
const handleDelete = async (reportId: string) => {
  // ... 沒有 try-catch
  await deleteReport(reportId);
};
```

**建議**: 所有 async 函數都應有錯誤處理

#### ⚠️ 錯誤 3: 狀態更新時機問題
**位置**: `src/pages/ReportManagement.tsx:105`
```typescript
// 從列表中移除
setReports(reports.filter((r) => r._id !== reportId));
```

**風險**: 如果 API 失敗但已從 UI 移除，會造成不一致

**建議**: 先等 API 成功，再更新 UI
```typescript
try {
  await deleteReport(reportId);
  setReports(reports.filter((r) => r._id !== reportId)); // ✅ 在這裡
} catch (error) {
  // 錯誤處理
}
```

### 3.2 邊界情況

#### ⚠️ 錯誤 4: 空陣列處理
**位置**: `src/data/mmContent.ts:17-19`
```typescript
export const getRandomQuote = (): string => {
  return mmQuotes[Math.floor(Math.random() * mmQuotes.length)];
};
```

**風險**: 如果 `mmQuotes` 為空陣列，會回傳 `undefined`

**建議**: 加上防禦性檢查
```typescript
export const getRandomQuote = (): string => {
  if (mmQuotes.length === 0) return "加油！";
  return mmQuotes[Math.floor(Math.random() * mmQuotes.length)];
};
```

#### ⚠️ 錯誤 5: 除以零
**位置**: 統計計算中
```typescript
// 如果 totalQuestions 為 0
const percentage = (score / totalQuestions) * 100; // NaN
```

**建議**: 加上檢查
```typescript
const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
```

### 3.3 型別安全

#### ⚠️ 錯誤 6: 未驗證的類型斷言
**位置**: `server/src/middleware/auth.ts:32`
```typescript
const decoded = jwt.verify(token, JWT_SECRET) as any;
```

**風險**: 如果 JWT payload 被竄改，可能導致錯誤

**建議**: 使用 Type Guard
```typescript
interface JWTPayload {
  id: string;
  username: string;
  role: string;
}

function isJWTPayload(obj: any): obj is JWTPayload {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.username === "string" &&
    typeof obj.role === "string"
  );
}

const decoded = jwt.verify(token, JWT_SECRET);
if (!isJWTPayload(decoded)) {
  throw new Error("Invalid token payload");
}
```

---

## 🔒 4. 資安疑慮與改善

### 4.1 嚴重等級 🚨

#### 🚨 資安 1: JWT_SECRET 使用預設值
**位置**:
- `server/src/middleware/auth.ts:5`
- `server/src/controllers/adminController.ts:6`

**問題**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';
```

**風險**:
- **嚴重性: CRITICAL**
- 如果未設定環境變數，使用預設值
- 攻擊者可以偽造任何 JWT token
- 可以以任何管理員身份登入

**改善方案**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// 或檢查強度
if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
```

#### 🚨 資安 2: JWT 存在 localStorage
**位置**: `src/services/authService.ts:32`

**問題**:
```typescript
localStorage.setItem(TOKEN_KEY, token);
```

**風險**:
- **嚴重性: HIGH**
- 容易受 XSS 攻擊竊取
- JavaScript 可完全存取
- 無 HttpOnly 保護

**改善方案**:

**選項 A: 使用 HttpOnly Cookie（推薦）**
```typescript
// 後端設定
res.cookie('authToken', token, {
  httpOnly: true,    // JavaScript 無法存取
  secure: true,      // 只在 HTTPS 傳輸
  sameSite: 'strict', // CSRF 保護
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 天
});

// 前端自動帶入，不需手動處理
```

**選項 B: 保持 localStorage 但加強防護**
```typescript
// 1. 實作 CSP (Content Security Policy)
// 2. 使用 XSS 防護 Header
// 3. 定期 token rotation
// 4. 短期有效時間 + refresh token
```

#### 🚨 資安 3: 密碼強度要求過低
**位置**: `server/src/models/Admin.ts:35`

**問題**:
```typescript
minlength: 6,  // 只需 6 碼
```

**風險**:
- **嚴重性: MEDIUM**
- 可在數小時內暴力破解
- 不符合現代安全標準

**改善方案**:
```typescript
// 1. 提高到至少 12 碼
minlength: 12,

// 2. 加入複雜度驗證
passwordSchema.pre('validate', function(next) {
  const password = this.password;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    next(new Error('密碼必須包含大小寫字母、數字和特殊字元'));
  }
  next();
});
```

### 4.2 高風險 ⚠️

#### ⚠️ 資安 4: 缺少 HTTPS 強制
**位置**: `server/src/server.ts`

**問題**: 沒有強制使用 HTTPS

**風險**:
- 資料可被中間人攻擊截取
- JWT token 明文傳輸
- 密碼可被竊聽

**改善方案**:
```typescript
// 1. 生產環境強制 HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// 2. 設定 HSTS Header
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});
```

#### ⚠️ 資安 5: 缺少 CSP (Content Security Policy)
**位置**: 全域

**問題**: 沒有設定 CSP Header

**風險**:
- XSS 攻擊
- 資料注入
- Clickjacking

**改善方案**:
```typescript
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // 盡量避免 unsafe-inline
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
    connectSrc: ["'self'", "https://api.yourserver.com"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}));

// 其他安全 Headers
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(helmet.frameguard({ action: 'deny' }));
```

#### ⚠️ 資安 6: 缺少 Rate Limiting
**位置**: API 路由

**問題**: 沒有請求頻率限制

**風險**:
- 暴力破解攻擊
- DDoS 攻擊
- 資源耗盡

**改善方案**:
```typescript
import rateLimit from 'express-rate-limit';

// 登入 API 嚴格限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次嘗試
  message: '登入嘗試次數過多，請 15 分鐘後再試',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/admin/login', loginLimiter);

// 一般 API 限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '請求過於頻繁，請稍後再試',
});

app.use('/api/', apiLimiter);
```

### 4.3 中風險 ℹ️

#### ℹ️ 資安 7: 輸入未清理（XSS 風險）
**位置**: 所有使用者輸入

**問題**: 未清理 HTML/JavaScript

**風險**: XSS 攻擊

**改善方案**:
```typescript
import sanitizeHtml from 'sanitize-html';

// 在儲存前清理
const sanitizeInput = (input: string): string => {
  return sanitizeHtml(input, {
    allowedTags: [], // 不允許任何 HTML 標籤
    allowedAttributes: {},
  });
};

// 使用
const report = new Report({
  bookName: sanitizeInput(req.body.bookName),
  questionContent: sanitizeInput(req.body.questionContent),
  issueDescription: sanitizeInput(req.body.issueDescription),
});
```

#### ℹ️ 資安 8: MongoDB Injection 風險
**位置**: 所有資料庫查詢

**問題**: 未過濾特殊字元

**風險**: NoSQL Injection

**改善方案**:
```typescript
import mongoSanitize from 'express-mongo-sanitize';

// 全域中間件
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`MongoDB injection attempt: ${key}`);
  },
}));

// 或手動檢查
const sanitizeQuery = (query: any) => {
  const sanitized = { ...query };
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      // 移除 $ 開頭的特殊操作符
      sanitized[key] = sanitized[key].replace(/^\$/, '');
    }
  });
  return sanitized;
};
```

#### ℹ️ 資安 9: CORS 設定過於寬鬆（未來風險）
**位置**: `server/src/server.ts:20-25`

**問題**:
```typescript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://medical-medium-test.vercel.app",
  process.env.FRONTEND_URL,
];
```

**風險**: 如果 `FRONTEND_URL` 被竄改

**改善方案**:
```typescript
// 白名單驗證
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://medical-medium-test.vercel.app',
];

// 只允許明確的域名
const allowedOrigins = ALLOWED_ORIGINS.filter(Boolean);

// 不允許動態域名
if (process.env.FRONTEND_URL &&
    ALLOWED_ORIGINS.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
```

#### ℹ️ 資安 10: 錯誤訊息洩露資訊
**位置**: 多處錯誤處理

**問題**:
```typescript
// server/src/controllers/adminController.ts:103
console.error('Login error:', error);
res.status(500).json({
  success: false,
  message: '登入時發生錯誤'  // ✅ 好的做法
});
```

**但在某些地方**:
```typescript
// 可能洩露資料庫結構或內部邏輯
catch (error) {
  res.status(500).json({ error: error.message }); // ❌ 危險
}
```

**改善方案**:
```typescript
// 統一的錯誤處理中間件
app.use((error, req, res, next) => {
  // 記錄完整錯誤（僅伺服器端）
  console.error('Error:', error);

  // 回傳通用訊息給用戶端（生產環境）
  const message = process.env.NODE_ENV === 'production'
    ? '伺服器錯誤，請稍後再試'
    : error.message;

  res.status(500).json({
    success: false,
    message,
    // 開發環境才回傳 stack trace
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});
```

---

## 💡 5. 其他建議

### 5.1 測試

#### 📝 問題：完全沒有測試
**現狀**: 0 個測試檔案（除了 node_modules）

**建議實作**:

```typescript
// 1. 單元測試 (Jest + React Testing Library)
// src/components/__tests__/GradeBadge.test.tsx
import { render } from '@testing-library/react';
import { GradeBadge } from '../GradeBadge';

describe('GradeBadge', () => {
  it('should render S grade with correct styles', () => {
    const { container } = render(<GradeBadge grade="S" />);
    const badge = container.firstChild;
    expect(badge).toHaveStyle({
      backgroundImage: expect.stringContaining('#E5C17A'),
    });
  });
});

// 2. API 測試 (Supertest)
// server/src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../server';

describe('POST /api/admin/login', () => {
  it('should return token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'correct_password' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
  });

  it('should lock account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/admin/login')
        .send({ username: 'admin', password: 'wrong' });
    }

    const response = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'correct_password' });

    expect(response.status).toBe(423);
    expect(response.body.message).toContain('鎖定');
  });
});

// 3. E2E 測試 (Playwright)
// e2e/quiz.spec.ts
import { test, expect } from '@playwright/test';

test('should complete quiz and see results', async ({ page }) => {
  await page.goto('/');
  await page.click('text=開始測驗');

  // 選擇書籍
  await page.check('[value="搶救肝臟"]');
  await page.click('text=初階');
  await page.click('text=開始');

  // 回答題目
  for (let i = 0; i < 20; i++) {
    await page.click('[data-testid="option-0"]');
    await page.click('text=下一題');
  }

  // 驗證結果頁
  await expect(page.locator('text=測驗完成')).toBeVisible();
});
```

**覆蓋率目標**:
- 關鍵業務邏輯: 80%+
- API 端點: 70%+
- UI 組件: 60%+

### 5.2 日誌與監控

#### 📝 問題：缺少結構化日誌

**建議實作**:

```typescript
// 使用 Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// 使用
logger.info('User logged in', { userId: admin._id, username: admin.username });
logger.error('Database connection failed', { error: error.message });
logger.warn('Suspicious activity detected', { ip: req.ip, attempts: 5 });
```

#### 📝 問題：缺少效能監控

**建議實作**:

```typescript
// 使用 Sentry 或 AppSignal
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Express 中間件
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// 錯誤處理
app.use(Sentry.Handlers.errorHandler());

// 自訂事件追蹤
Sentry.captureMessage('Quiz completed', {
  level: 'info',
  extra: { score, userId, book },
});
```

### 5.3 CI/CD

#### 📝 問題：沒有自動化部署流程

**建議實作 GitHub Actions**:

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 5.4 文檔

#### 📝 問題：API 文檔不完整

**建議**:

```typescript
// 使用 Swagger/OpenAPI
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MMQuiz API',
      version: '1.0.0',
      description: '醫療靈媒測驗 API 文檔',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '開發環境',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 在路由中加上註解
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: 管理員登入
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登入成功
 *       401:
 *         description: 帳號或密碼錯誤
 */
router.post('/login', login);
```

### 5.5 資料庫

#### 📝 問題：缺少備份策略

**建議**:

```bash
# 1. 設定 MongoDB Atlas 自動備份（建議每日）

# 2. 本地備份腳本
# scripts/backup-db.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# 保留最近 30 天的備份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

#### 📝 問題：缺少資料遷移工具

**建議**:

```typescript
// 使用 migrate-mongo
// migrations/20250107-add-report-priority.js
module.exports = {
  async up(db, client) {
    await db.collection('reports').updateMany(
      {},
      { $set: { priority: 'medium' } }
    );
  },

  async down(db, client) {
    await db.collection('reports').updateMany(
      {},
      { $unset: { priority: '' } }
    );
  }
};
```

### 5.6 開發工具

#### 📝 建議加入的工具

**ESLint 設定優化**:
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:security/recommended"  // 安全性檢查
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error",  // 禁止 any
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Prettier 設定**:
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Husky + lint-staged**:
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 📊 優先級建議

### 🔴 立即處理（1-2 天）

1. **修復 JWT_SECRET 預設值問題** - 資安 1
2. **建立 .env.example** - 問題 13
3. **加入環境變數驗證** - 問題 14
4. **提高密碼強度要求** - 資安 3

### 🟡 短期處理（1 週）

5. **實作 Rate Limiting** - 資安 6
6. **加入 Helmet 安全 Headers** - 資安 5
7. **統一錯誤處理** - 問題 7
8. **加入資料庫索引** - 問題 4
9. **改用 HttpOnly Cookie 存 JWT** - 資安 2

### 🟢 中期處理（2-4 週）

10. **實作 Code Splitting** - 問題 1
11. **加入測試（至少 API 測試）** - 測試建議
12. **設定 CI/CD** - CI/CD 建議
13. **加入 Sentry 監控** - 監控建議
14. **實作輸入清理** - 資安 7

### ⚪ 長期優化（1-2 個月）

15. **效能優化（圖片、Memoization）** - 問題 2, 3
16. **完善測試覆蓋率** - 測試建議
17. **API 文檔（Swagger）** - 文檔建議
18. **資料庫備份策略** - 資料庫建議

---

## 📝 總結

### ✅ 優點

1. **良好的架構**: 前後端分離，模組化清晰
2. **安全意識**: 有登入鎖定、密碼加密、輸入驗證
3. **使用者體驗**: UI 美觀，互動流暢，動畫效果好
4. **功能完整**: 測驗、管理、統計、排行榜、問題回報一應俱全
5. **文檔化**: 有 remind.md 和 SOP 文檔，經驗傳承良好

### ⚠️ 需要改進

1. **資安**: JWT_SECRET、localStorage、CSP、Rate Limiting
2. **測試**: 完全缺少測試
3. **效能**: 缺少 Code Splitting 和優化
4. **監控**: 缺少日誌和錯誤追蹤
5. **CI/CD**: 手動部署，無自動化

### 🎯 建議行動

**第一週**:
1. 修復所有 🔴 級別的資安問題
2. 建立 .env.example 和環境變數驗證
3. 加入 Rate Limiting

**第一個月**:
1. 實作 HttpOnly Cookie
2. 加入 Helmet 和 CSP
3. 設定基本的 API 測試
4. 設定 CI/CD

**第二個月**:
1. 效能優化（Code Splitting）
2. 完善測試覆蓋率
3. 加入監控和日誌
4. API 文檔

### 💬 最後建議

這是一個**功能完整、架構良好**的專案，但在**資安和測試**方面有明顯不足。

建議優先處理資安問題，特別是 JWT_SECRET 和 localStorage，這兩個是最嚴重的漏洞。

其次，建立測試和 CI/CD 流程，確保未來的變更不會引入新問題。

效能優化和監控可以逐步進行，不急於一時。

**總體評分**: 7.5/10
- 功能性: 9/10
- 代碼品質: 7/10
- 資安性: 5/10 ⚠️
- 可維護性: 8/10
- 測試覆蓋: 0/10 ❌

---

**審查完成日期**: 2025-01-07
**下次審查建議**: 1 個月後（2025-02-07）
