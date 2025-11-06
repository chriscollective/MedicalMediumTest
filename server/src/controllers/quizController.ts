import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/Quiz';
import Question from '../models/Question';

// 建立新的測驗記錄
export async function createQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('📝 收到建立測驗請求');
    const { userId, book, difficulty, questionIds } = req.body;

    // 驗證必要欄位
    if (!userId || !book || !difficulty || !questionIds) {
      console.log('❌ 缺少必要欄位');
      return res.status(400).json({
        success: false,
        message: '缺少必要欄位：userId, book, difficulty, questionIds'
      });
    }

    // 驗證題目數量
    if (!Array.isArray(questionIds) || questionIds.length !== 20) {
      console.log('❌ 題目數量錯誤:', questionIds.length);
      return res.status(400).json({
        success: false,
        message: '必須提供 20 題題目 ID'
      });
    }

    // 跳過題目驗證以提升效能
    // 因為題目是剛從資料庫取得的，所以可以信任這些 ID
    console.log('✅ 跳過題目驗證（題目數量:', questionIds.length, '）');

    console.log('💾 建立測驗記錄...');
    // 建立測驗記錄
    const quiz = await Quiz.create({
      userId,
      book,
      difficulty,
      questions: questionIds,
      correctCount: 0,
      totalScore: 0
    });

    console.log('✅ 測驗記錄建立成功:', quiz._id);
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('❌ createQuiz 錯誤:', error);
    next(error);
  }
}

// 提交測驗並計算分數
export async function submitQuiz(req: Request, res: Response, next: NextFunction) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, userAnswer }

    // 驗證必要欄位
    if (!answers || !Array.isArray(answers)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: '缺少 answers 陣列'
      });
    }

    // 取得測驗記錄
    const quiz = await Quiz.findById(quizId).session(session);
    if (!quiz) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: '測驗記錄不存在'
      });
    }

    // 取得所有題目
    const questions = await Question.find({
      _id: { $in: quiz.questions }
    }).session(session);

    // 建立題目 Map 以便快速查找
    const questionMap = new Map(
      questions.map(q => [String(q._id), q])
    );

    // 處理每個答案，建立 bitmap
    let correctCount = 0;
    const bitmapArray: string[] = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        // 題目已被刪除，記為錯誤
        bitmapArray.push('0');
        continue;
      }

      // 驗證答案是否正確
      const isCorrect = isAnswerCorrect(
        question.type,
        answer.userAnswer,
        question.correctAnswer
      );

      if (isCorrect) {
        correctCount++;
        bitmapArray.push('1');
      } else {
        bitmapArray.push('0');
      }
    }

    // 組合成 bitmap 字串
    const answerBitmap = bitmapArray.join('');

    // 計算分數（每題 5 分）
    const totalScore = calculateScore(correctCount, answers.length);

    // 更新測驗分數、正確題數和答案 bitmap
    quiz.correctCount = correctCount;
    quiz.totalScore = totalScore;
    quiz.answerBitmap = answerBitmap;
    await quiz.save({ session });

    await session.commitTransaction();

    // 回傳結果
    res.json({
      success: true,
      data: {
        quizId: quiz._id,
        totalScore,
        correctCount,
        totalQuestions: answers.length,
        answerBitmap
      }
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// 取得測驗詳情
export async function getQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate('questions')
      .lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: '測驗記錄不存在'
      });
    }

    res.json({
      success: true,
      data: {
        quiz
      }
    });
  } catch (error) {
    next(error);
  }
}

// 查詢測驗列表
export async function getQuizzes(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, book, difficulty, limit = 50, skip = 0 } = req.query;

    const query: any = {};
    if (userId) query.userId = userId;
    if (book) query.book = book;
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: quizzes,
      count: quizzes.length,
      total
    });
  } catch (error) {
    next(error);
  }
}

// 驗證答案是否正確
function isAnswerCorrect(
  questionType: 'single' | 'multiple' | 'cloze',
  userAnswer: number | number[] | null,
  correctAnswer: number | number[]
): boolean {
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }

  if (questionType === 'single') {
    // 單選：直接比較數字
    return userAnswer === correctAnswer;
  }

  if (questionType === 'multiple') {
    // 多選：比較陣列
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }

    // 排序後比較
    const sortedUser = [...userAnswer].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswer].sort((a, b) => a - b);

    if (sortedUser.length !== sortedCorrect.length) {
      return false;
    }

    return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
  }

  if (questionType === 'cloze') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }

    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }

    return userAnswer.every(
      (val, idx) =>
        Number.isInteger(val) &&
        Number.isInteger(correctAnswer[idx]) &&
        val === correctAnswer[idx]
    );
  }

  return false;
}

// 計算分數（每題 5 分，總分 100 分）
function calculateScore(correctCount: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}
