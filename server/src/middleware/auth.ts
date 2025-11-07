import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

// 強制要求設定 JWT_SECRET 環境變數
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    '❌ CRITICAL: JWT_SECRET environment variable is not set!\n' +
    'Please set JWT_SECRET in your .env file with a strong secret key (at least 32 characters).\n' +
    'Example: JWT_SECRET=your-very-long-and-secure-random-string-here'
  );
}

// 驗證 JWT_SECRET 強度
if (JWT_SECRET.length < 32) {
  throw new Error(
    '❌ CRITICAL: JWT_SECRET is too short!\n' +
    `Current length: ${JWT_SECRET.length} characters\n` +
    'JWT_SECRET must be at least 32 characters for security.\n' +
    'Please generate a stronger secret key.'
  );
}

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
    role: string;
  };
}

// Verify JWT token middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供驗證 token，請先登入'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: '無效的 token 或帳號已被停用'
      });
    }

    // Attach admin info to request
    req.admin = {
      id: String(admin._id),
      username: admin.username,
      role: admin.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token 已過期，請重新登入'
      });
    }

    return res.status(401).json({
      success: false,
      message: '無效的 token'
    });
  }
};

// Check if admin has super admin role
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.admin?.role !== 'super') {
    return res.status(403).json({
      success: false,
      message: '權限不足，需要超級管理員權限'
    });
  }
  next();
};
