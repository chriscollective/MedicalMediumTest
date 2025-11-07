import express from "express";
import {
  submitReport,
  getAllReports,
  updateReportStatus,
  getReportStats,
} from "../controllers/reportController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// 公開路由：提交問題回報
router.post("/", submitReport);

// 管理員路由：需要認證
router.get("/", authenticate, getAllReports);
router.get("/stats", authenticate, getReportStats);
router.patch("/:id", authenticate, updateReportStatus);

export default router;
