import rateLimit from 'express-rate-limit';

/**
 * 全域 Rate Limiter
 * 適用於一般 API 端點
 * 限制：每個 IP 每 15 分鐘最多 100 次請求
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 次請求
  message: {
    success: false,
    error: '請求次數過多，請稍後再試'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // 使用預設的 IP 識別方式（自動處理 IPv4 和 IPv6）
});

/**
 * 嚴格的 Rate Limiter（登入端點）
 * 防止暴力破解攻擊
 * 限制：每個 IP 每 15 分鐘最多 5 次請求
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次請求
  message: {
    success: false,
    error: '登入嘗試次數過多，請 15 分鐘後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // 成功的請求也計數（防止多次測試帳號）
});

/**
 * 排行榜提交限制
 * 防止洗榜攻擊
 * 限制：每個 IP 每小時最多 10 次提交（與測驗建立限制同步）
 * 注意：額外在 controller 層檢查每個 quizId 只能提交一次
 */
export const leaderboardLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 10, // 最多 10 次提交（與測驗限制相同）
  message: {
    success: false,
    error: '排行榜提交次數已達上限，請 1 小時後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 題目查詢限制
 * 防止爬蟲竊取題庫
 * 限制：每個 IP 每 15 分鐘最多 30 次請求
 */
export const questionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 30, // 最多 30 次請求
  message: {
    success: false,
    error: '題目查詢次數過多，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 測驗建立限制
 * 防止濫用測驗系統
 * 限制：每個 IP 每小時最多 10 次測驗
 */
export const quizLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 10, // 最多 10 次測驗
  message: {
    success: false,
    error: '測驗建立次數已達上限，請 1 小時後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 管理員操作限制
 * 防止管理員帳號被濫用
 * 限制：每個 IP 每 15 分鐘最多 50 次請求
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 50, // 最多 50 次請求
  message: {
    success: false,
    error: '管理員操作次數過多，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
