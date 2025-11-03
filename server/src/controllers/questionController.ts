import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import Question from "../models/Question";

/**
 * 題目控制器（Question Controller）
 * - 提供題目查詢、單筆查詢、建立、更新、刪除等 API 處理邏輯
 * - 注意：建立與更新會（透過路由 middleware 或此處）帶入 createdBy/updatedBy
 */

/**
 * 取得題目清單
 * 支援查詢參數：book、difficulty、type、limit（預設 20）、random（"true" 則隨機抽樣）
 */
export async function getQuestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { book, difficulty, type, limit = 20, random } = req.query;

    // 偵錯用：輸出查詢參數（使用 ASCII 避免編碼問題）
    console.log("Query params:", { book, difficulty, type, limit, random });

    const query: any = {};
    if (book) query.book = book;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;

    // 偵錯用：輸出 MongoDB 查詢物件
    console.log("MongoDB query:", query);

    if (random === "true") {
      // 隨機抽樣題目（$sample 依 limit 大小抽）
      const questions = await Question.aggregate([
        { $match: query },
        { $sample: { size: Number(limit) } },
      ]);
      return res.json({
        success: true,
        data: questions,
        count: questions.length,
      });
    }

    // 一般查詢：依條件查詢並限制筆數
    const questions = await Question.find(query).limit(Number(limit));
    return res.json({
      success: true,
      data: questions,
      count: questions.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 取得單一題目
 */
export async function getQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
}

/**
 * 建立題目
 * - 由 AuthRequest 取得目前管理員帳號，寫入 createdBy/updatedBy
 */
export async function createQuestion(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = req.admin?.username || "system";
    const payload: any = { ...req.body, createdBy: actor, updatedBy: actor };
    const question = await Question.create(payload);
    res.status(201).json({
      success: true,
      data: question,
      message: "Question created successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 更新題目
 * - 目前採直接合併 req.body 的簡化寫法；若需要更嚴謹的審計，可在此補上 history push
 */
export async function updateQuestion(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    // 合併更新欄位（如需限制可於此處白名單化）
    Object.assign(question, req.body);

    // 儲存（會觸發 Mongoose 驗證與 timestamps 更新）
    await question.save();

    res.json({
      success: true,
      data: question,
      message: "Question updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 刪除題目
 */
export async function deleteQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
