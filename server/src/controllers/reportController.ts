import { Request, Response } from "express";
import Report from "../models/Report";

/**
 * 提交新的問題回報
 */
export async function submitReport(req: Request, res: Response) {
  try {
    const { bookName, questionType, questionContent, issueDescription } =
      req.body;

    // 驗證必填欄位
    if (!bookName || !questionType || !questionContent || !issueDescription) {
      return res.status(400).json({
        error: "缺少必填欄位",
        required: [
          "bookName",
          "questionType",
          "questionContent",
          "issueDescription",
        ],
      });
    }

    // 建立新回報
    const report = new Report({
      bookName,
      questionType,
      questionContent,
      issueDescription,
      status: "pending",
    });

    await report.save();

    res.status(201).json({
      message: "問題回報已提交",
      reportId: report._id,
    });
  } catch (error) {
    console.error("提交問題回報失敗:", error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

/**
 * 取得所有問題回報（管理員功能）
 */
export async function getAllReports(req: Request, res: Response) {
  try {
    const { status, bookName, limit = 100, skip = 0 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (bookName) filter.bookName = bookName;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      total,
      limit: Number(limit),
      skip: Number(skip),
    });
  } catch (error) {
    console.error("取得問題回報失敗:", error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

/**
 * 更新問題回報狀態（管理員功能）
 */
export async function updateReportStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, resolvedBy, notes } = req.body;

    const updateData: any = { status };

    if (status === "resolved" || status === "dismissed") {
      updateData.resolvedAt = new Date();
      if (resolvedBy) updateData.resolvedBy = resolvedBy;
    }

    if (notes) updateData.notes = notes;

    const report = await Report.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!report) {
      return res.status(404).json({ error: "找不到該回報" });
    }

    res.json({ message: "狀態已更新", report });
  } catch (error) {
    console.error("更新問題回報失敗:", error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}

/**
 * 取得問題回報統計（管理員功能）
 */
export async function getReportStats(req: Request, res: Response) {
  try {
    const [statusStats, bookStats, typeStats] = await Promise.all([
      // 依狀態統計
      Report.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // 依書籍統計
      Report.aggregate([
        { $group: { _id: "$bookName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // 依題型統計
      Report.aggregate([
        { $group: { _id: "$questionType", count: { $sum: 1 } } },
      ]),
    ]);

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });

    res.json({
      total: totalReports,
      pending: pendingReports,
      byStatus: statusStats,
      byBook: bookStats,
      byType: typeStats,
    });
  } catch (error) {
    console.error("取得統計資料失敗:", error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}
