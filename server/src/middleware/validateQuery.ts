import { Request, Response, NextFunction } from 'express';

/**
 * 驗證並清理查詢參數
 * 防止 NoSQL 注入攻擊
 */

/**
 * 驗證字串類型查詢參數
 * 只允許字母、數字、中文、空格、部分特殊符號
 */
function isValidString(value: any): boolean {
  if (typeof value !== 'string') return false;
  // 允許：字母、數字、中文、空格、常見標點符號
  // 禁止：$、.、{}、[]、<>、\、/ 等可能用於注入的字符
  const safePattern = /^[a-zA-Z0-9\u4e00-\u9fa5\s\-_+,!?()（）「」《》：；。，、！？]*$/;
  return safePattern.test(value) && value.length <= 100;
}

/**
 * 驗證數字類型查詢參數
 */
function isValidNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 10000;
}

/**
 * 驗證布林類型查詢參數
 */
function isValidBoolean(value: any): boolean {
  return value === 'true' || value === 'false';
}

/**
 * 通用查詢參數驗證器
 *
 * 使用方式：
 * router.get('/', validateQueryParams({
 *   book: 'string',
 *   difficulty: { type: 'string', enum: ['初階', '進階'] },
 *   limit: 'number',
 *   random: 'boolean'
 * }), handler);
 */
export function validateQueryParams(schema: {
  [key: string]: 'string' | 'number' | 'boolean' | {
    type: 'string' | 'number' | 'boolean';
    enum?: any[];
    optional?: boolean;
  }
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // 檢查是否有未定義的查詢參數（防止額外參數攻擊）
    const allowedKeys = Object.keys(schema);
    const providedKeys = Object.keys(req.query);
    const unexpectedKeys = providedKeys.filter(key => !allowedKeys.includes(key));

    if (unexpectedKeys.length > 0) {
      console.warn(`⚠️  Unexpected query parameters: ${unexpectedKeys.join(', ')}`);
      // 不拒絕請求，但記錄警告
    }

    // 驗證每個定義的參數
    for (const [key, rule] of Object.entries(schema)) {
      const value = req.query[key];

      // 解析規則
      const isOptional = typeof rule === 'object' && rule.optional === true;
      const type = typeof rule === 'string' ? rule : rule.type;
      const enumValues = typeof rule === 'object' ? rule.enum : undefined;

      // 如果參數不存在
      if (value === undefined || value === '') {
        if (!isOptional) {
          errors.push(`Missing required parameter: ${key}`);
        }
        continue;
      }

      // 類型驗證
      let isValid = false;
      switch (type) {
        case 'string':
          isValid = isValidString(value);
          break;
        case 'number':
          isValid = isValidNumber(value);
          break;
        case 'boolean':
          isValid = isValidBoolean(value);
          break;
      }

      if (!isValid) {
        errors.push(`Invalid ${type} value for parameter: ${key}`);
        continue;
      }

      // Enum 驗證
      if (enumValues && !enumValues.includes(value)) {
        errors.push(`Invalid value for ${key}. Allowed: ${enumValues.join(', ')}`);
      }
    }

    // 如果有錯誤，返回 400
    if (errors.length > 0) {
      console.warn(`⚠️  Query validation failed: ${errors.join('; ')}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: errors
      });
    }

    next();
  };
}

/**
 * 題目查詢專用驗證器
 * GET /api/questions?book=xxx&difficulty=xxx&type=xxx&limit=20&random=true
 */
export const validateQuestionQuery = validateQueryParams({
  book: { type: 'string', optional: true },
  difficulty: { type: 'string', enum: ['初階', '進階'], optional: true },
  type: { type: 'string', enum: ['single', 'multiple', 'cloze'], optional: true },
  limit: { type: 'number', optional: true },
  random: { type: 'boolean', optional: true }
});

/**
 * 排行榜查詢專用驗證器
 * GET /api/leaderboard/:book
 */
export const validateLeaderboardQuery = validateQueryParams({
  // 排行榜目前沒有 query params，但保留擴展性
});

/**
 * 分析查詢專用驗證器
 * GET /api/analytics/xxx
 */
export const validateAnalyticsQuery = validateQueryParams({
  // 可以根據需求擴展
});
