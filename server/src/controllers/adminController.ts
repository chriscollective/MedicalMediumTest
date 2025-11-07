import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

// 強制要求設定 JWT_SECRET 環境變數
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    '❌ CRITICAL: JWT_SECRET environment variable is not set!\n' +
    'Please set JWT_SECRET in your .env file.'
  );
}

if (JWT_SECRET.length < 32) {
  throw new Error(
    '❌ CRITICAL: JWT_SECRET is too short! Must be at least 32 characters.'
  );
}

const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供使用者名稱和密碼'
      });
    }

    // Find admin
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '使用者名稱或密碼錯誤'
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      const lockTimeRemaining = Math.ceil(
        (admin.lockUntil!.getTime() - Date.now()) / 1000 / 60
      );
      return res.status(423).json({
        success: false,
        message: `帳號已被鎖定，請在 ${lockTimeRemaining} 分鐘後再試`
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: '帳號已被停用，請聯繫系統管理員'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incrementLoginAttempts();

      // Check if account is now locked
      const updatedAdmin = await Admin.findById(admin._id);
      if (updatedAdmin && updatedAdmin.isLocked()) {
        return res.status(423).json({
          success: false,
          message: '登入失敗次數過多，帳號已被鎖定 15 分鐘'
        });
      }

      return res.status(401).json({
        success: false,
        message: '使用者名稱或密碼錯誤',
        remainingAttempts: 5 - (updatedAdmin?.loginAttempts || 0)
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: '登入成功',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登入時發生錯誤'
    });
  }
};

// Verify token (for checking if user is still logged in)
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供驗證 token'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: '無效的 token 或帳號已被停用'
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '無效的 token'
    });
  }
};

// Logout (client-side will remove token, but we can add server-side logic if needed)
export const logout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '登出成功'
  });
};

// Get current admin info
export const getCurrentAdmin = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供驗證 token'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '找不到管理員資料'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '無效的 token'
    });
  }
};

// Change password (requires authentication)
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.admin?.id;
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!adminId) {
      return res.status(401).json({ success: false, message: "未授權" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "請提供目前密碼與新密碼" });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "新密碼長度至少需 6 碼" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: "找不到管理員帳號" });
    }

    const ok = await admin.comparePassword(currentPassword);
    if (!ok) {
      return res.status(401).json({ success: false, message: "目前密碼不正確" });
    }

    const same = await admin.comparePassword(newPassword);
    if (same) {
      return res.status(400).json({ success: false, message: "新密碼不可與舊密碼相同" });
    }

    admin.password = newPassword; // pre-save hook 會自動雜湊
    await admin.save();

    return res.json({ success: true, message: "密碼已更新" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "更新密碼發生錯誤" });
  }
};