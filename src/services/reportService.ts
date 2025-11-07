/**
 * 問題回報服務
 * 將使用者回報的問題提交到 MongoDB
 */

import api from "./api";

interface IssueReport {
  bookName: string;
  questionType: string;
  questionContent: string;
  issueDescription: string;
}

/**
 * 提交問題回報到後端 API
 * @param report 回報內容
 */
export async function submitIssueReport(report: IssueReport): Promise<void> {
  try {
    const response = await api.post("/reports", report);

    if (response.data.reportId) {
      console.log("問題回報已提交，ID:", response.data.reportId);
    }
  } catch (error: any) {
    console.error("提交問題回報失敗:", error);
    throw new Error(
      error.response?.data?.error || "提交失敗，請稍後再試"
    );
  }
}

/**
 * 取得所有問題回報（管理員功能）
 */
export async function getAllReports(params?: {
  status?: string;
  bookName?: string;
  limit?: number;
  skip?: number;
}) {
  try {
    const response = await api.get("/reports", { params });
    return response.data;
  } catch (error: any) {
    console.error("取得問題回報失敗:", error);
    throw new Error(
      error.response?.data?.error || "取得失敗，請稍後再試"
    );
  }
}

/**
 * 更新問題回報狀態（管理員功能）
 */
export async function updateReportStatus(
  id: string,
  data: {
    status: string;
    resolvedBy?: string;
    notes?: string;
  }
) {
  try {
    const response = await api.patch(`/reports/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("更新問題回報失敗:", error);
    throw new Error(
      error.response?.data?.error || "更新失敗，請稍後再試"
    );
  }
}

/**
 * 取得問題回報統計（管理員功能）
 */
export async function getReportStats() {
  try {
    const response = await api.get("/reports/stats");
    return response.data;
  } catch (error: any) {
    console.error("取得統計資料失敗:", error);
    throw new Error(
      error.response?.data?.error || "取得失敗，請稍後再試"
    );
  }
}
