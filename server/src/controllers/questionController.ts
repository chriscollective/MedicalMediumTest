import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import Question, { IQuestion } from "../models/Question";

function normalizeQuestionPayload(
  body: any,
  actor: string,
  existing?: IQuestion
) {
  const payload: any = { ...body };
  const type = payload.type || existing?.type;

  if (!type) {
    throw new Error("題目類型為必填");
  }

  payload.type = type;
  payload.updatedBy = actor;

  const ensureNumberArray = (value: any): number[] => {
    if (!Array.isArray(value)) {
      throw new Error("答案必須是陣列");
    }
    const result = value.map((v) => {
      const num = typeof v === "string" ? Number(v) : v;
      if (!Number.isInteger(num)) {
        throw new Error("答案必須為整數索引");
      }
      return num;
    });
    return result;
  };

  switch (type) {
    case "single": {
      if (!Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("單選題需要至少 2 個選項");
      }
      payload.options = payload.options.map((opt: any) => String(opt ?? "").trim());
      const answer =
        payload.correctAnswer !== undefined
          ? payload.correctAnswer
          : existing?.correctAnswer;
      if (answer === undefined || answer === null) {
        throw new Error("單選題需要提供正確答案索引");
      }
      const numericAnswer =
        typeof answer === "string" ? Number(answer) : Number(answer);
      if (!Number.isInteger(numericAnswer) || numericAnswer < 0) {
        throw new Error("單選題正確答案必須為非負整數索引");
      }
      if (numericAnswer >= payload.options.length) {
        throw new Error("單選題正確答案索引超出選項範圍");
      }
      payload.correctAnswer = numericAnswer;
      payload.fillOptions = [];
      break;
    }
    case "multiple": {
      if (!Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("多選題需要至少 2 個選項");
      }
      payload.options = payload.options.map((opt: any) => String(opt ?? "").trim());
      const answers = ensureNumberArray(
        payload.correctAnswer !== undefined
          ? payload.correctAnswer
          : existing?.correctAnswer
      );
      if (answers.length === 0) {
        throw new Error("多選題需要至少一個正確選項");
      }
      const optionLength = payload.options.length;
      const dedupedAnswers = Array.from(new Set(answers));
      if (dedupedAnswers.some((idx) => idx < 0 || idx >= optionLength)) {
        throw new Error("多選題答案索引超出選項範圍");
      }
      payload.correctAnswer = dedupedAnswers.sort((a, b) => a - b);
      payload.fillOptions = [];
      break;
    }
    case "fill": {
      const fillOptions =
        Array.isArray(payload.fillOptions) && payload.fillOptions.length > 0
          ? payload.fillOptions
          : existing?.fillOptions;
      if (!fillOptions || fillOptions.length < 3) {
        throw new Error("填空題需要至少 3 個填答選項");
      }
      payload.fillOptions = fillOptions.map((opt: any) => String(opt ?? "").trim());
      payload.options = [];
      const answer =
        payload.correctAnswer !== undefined
          ? payload.correctAnswer
          : existing?.correctAnswer;
      if (answer === undefined || answer === null) {
        throw new Error("填空題需要提供正確答案索引");
      }
      const numericAnswer =
        typeof answer === "string" ? Number(answer) : Number(answer);
      if (!Number.isInteger(numericAnswer) || numericAnswer < 0) {
        throw new Error("填空題正確答案必須為非負整數索引");
      }
      if (numericAnswer >= payload.fillOptions.length) {
        throw new Error("填空題正確答案索引超出選項範圍");
      }
      payload.correctAnswer = numericAnswer;
      break;
    }
    case "cloze": {
      if (!Array.isArray(payload.options)) {
        payload.options = existing?.options ?? [];
      }
      payload.options = payload.options.map((opt: any) =>
        String(opt ?? "").trim()
      );
      const optionCount = payload.options.length;
      if (
        optionCount < 1 ||
        optionCount > 6 ||
        payload.options.some((opt: string) => opt.length === 0)
      ) {
        throw new Error("克漏字題需提供 1-6 個非空選項");
      }
      const answers = ensureNumberArray(
        payload.correctAnswer !== undefined
          ? payload.correctAnswer
          : existing?.correctAnswer
      );
      if (answers.length < 1 || answers.length > optionCount) {
        throw new Error("克漏字題答案數量需介於 1 與選項數量之間");
      }
      const unique = new Set(answers);
      const validRange = answers.every(
        (idx) => idx >= 0 && idx < optionCount
      );
      if (!validRange || unique.size !== answers.length) {
        throw new Error("克漏字題答案索引必須介於 0-選項數量-1 且不可重複");
      }
      payload.correctAnswer = answers;
      payload.fillOptions = [];
      break;
    }
    default:
      throw new Error("不支援的題目類型");
  }

  // 一般欄位正規化
  if (payload.question) {
    payload.question = String(payload.question).trim();
  }
  if (payload.source) {
    payload.source = String(payload.source).trim();
  }
  if (payload.explanation) {
    payload.explanation = String(payload.explanation).trim();
  }

  return payload;
}

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
    const payload = normalizeQuestionPayload(req.body, actor);
    payload.createdBy = actor;

    const question = await Question.create(payload);
    res.status(201).json({
      success: true,
      data: question,
      message: "Question created successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
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

    const actor = req.admin?.username || "system";
    const payload = normalizeQuestionPayload(req.body, actor, question);

    // 合併更新欄位（如需限制可於此處白名單化）
    Object.assign(question, payload);

    // 儲存（會觸發 Mongoose 驗證與 timestamps 更新）
    await question.save();

    res.json({
      success: true,
      data: question,
      message: "Question updated successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
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
