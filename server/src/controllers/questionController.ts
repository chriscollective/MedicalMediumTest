import { Request, Response, NextFunction } from 'express';
import Question from '../models/Question';

export async function getQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { book, difficulty, type, limit = 20, random } = req.query;

    console.log('📥 Query params:', { book, difficulty, type, limit, random });

    const query: any = {};
    if (book) query.book = book;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;

    console.log('🔍 MongoDB query:', query);

    // 隨機抽取
    if (random === 'true') {
      const questions = await Question.aggregate([
        { $match: query },
        { $sample: { size: Number(limit) } }
      ]);
      return res.json({ success: true, data: questions, count: questions.length });
    }

    // 一般查詢
    const questions = await Question.find(query).limit(Number(limit));
    res.json({ success: true, data: questions, count: questions.length });
  } catch (error) {
    next(error);
  }
}

export async function getQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
}

export async function createQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // 先找到 document，然後更新並儲存
    // 這樣 validator 的 this 會指向完整的 document
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // 更新欄位
    Object.assign(question, req.body);

    // 儲存並觸發 validators
    await question.save();

    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
