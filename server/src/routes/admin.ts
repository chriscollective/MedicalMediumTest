import express from "express";
import {
  login,
  verifyToken,
  logout,
  getCurrentAdmin,
  changePassword,
} from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { authLimiter, adminLimiter } from "../middleware/rateLimiter";
import { getAdminsBasic, updateMyNote } from "../controllers/adminNotesController";

const router = express.Router();

// Public routes (嚴格限制，防止暴力破解)
router.post("/login", authLimiter, login);
router.post("/verify", authLimiter, verifyToken);

// Protected routes (require authentication)
// 管理員操作也需要限制，防止帳號被濫用
router.post("/logout", authenticate, adminLimiter, logout);
router.get("/me", authenticate, adminLimiter, getCurrentAdmin);
router.post("/change-password", authenticate, adminLimiter, changePassword);
router.get("/admins-basic", authenticate, adminLimiter, getAdminsBasic);
router.put("/me/note", authenticate, adminLimiter, updateMyNote);

export default router;
