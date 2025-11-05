import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QuestionCard, Question } from "../components/QuestionCard";
import { QuizProgress } from "../components/QuizProgress";
import { Button } from "../components/ui/button";
import { NatureAccents } from "../components/NatureAccents";
import { ChevronLeft, ChevronRight, Home, Pause, Sparkles } from "lucide-react";
import {
  fetchQuizQuestions,
  fetchMixedQuizQuestions,
} from "../services/questionService";
import { createQuiz, submitQuiz } from "../services/quizService";
import { getUserId } from "../utils/userStorage";
import { Question as ApiQuestion } from "../types/question";
import { getBookByDisplay, getDifficultyByKey } from "../constants/books";
import { mockQuestions } from "../data/mockQuestions";

interface QuizResult {
  score: number;
  totalQuestions: number;
  wrongQuestions: Array<{
    question: Question;
    userAnswer: string | string[];
  }>;
  answers: Record<string, string | string[]>;
}

interface QuizPageProps {
  books: string[];
  difficulty: string;
  onComplete: (result: QuizResult) => void;
  onBack: () => void;
}

export function QuizPage({
  books,
  difficulty,
  onComplete,
  onBack,
}: QuizPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[]>([]);

  // 載入題目
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);

        const startTime = performance.now();
        console.log(
          "[QuizPage] 開始載入測驗題目",
          new Date().toISOString()
        );

        // 使用映射轉換難度（beginner/advanced -> 初階/進階）
        const apiDifficulty = getDifficultyByKey(difficulty);

        let apiQuestions: ApiQuestion[];

        // 如果選擇多本書，使用混合抽題
        if (books.length > 1) {
          // 轉換所有書籍名稱
          const dbBooks = books.map((bookDisplay) =>
            getBookByDisplay(bookDisplay)
          );
          console.log("📚 準備載入多本書混合題目:", {
            books: dbBooks,
            difficulty: apiDifficulty,
          });

          apiQuestions = await fetchMixedQuizQuestions(dbBooks, apiDifficulty);
        } else {
          // 單本書，使用原本的邏輯
          const bookDisplay = books[0] || "《神奇西芹汁》";
          const book = getBookByDisplay(bookDisplay);
          console.log("📚 準備載入單本書題目:", {
            book,
            difficulty: apiDifficulty,
          });

          apiQuestions = await fetchQuizQuestions(book, apiDifficulty);
        }

        if (apiQuestions.length !== 20) {
          throw new Error(
            `題庫不足，僅取得 ${apiQuestions.length} 題，需要 20 題`
          );
        }

        // 轉換 API 格式為 UI 格式
        const uiQuestions: Question[] = apiQuestions.map((q: ApiQuestion) => {
          let correctAnswerStr: string | string[] | undefined;

          if (q.type === "single") {
            correctAnswerStr = q.options?.[q.correctAnswer as number] || "";
          } else if (q.type === "multiple") {
            const indices = q.correctAnswer as number[];
            correctAnswerStr = indices
              .map((idx) => q.options?.[idx] || "")
              .filter(Boolean);
          } else if (q.type === "fill") {
            correctAnswerStr = q.fillOptions?.[q.correctAnswer as number] || "";
          } else if (q.type === "cloze") {
            const indices = Array.isArray(q.correctAnswer)
              ? (q.correctAnswer as number[])
              : [];
            correctAnswerStr = indices
              .map((idx) => q.options?.[idx] || "")
              .filter(Boolean);
          }

          return {
            id: q._id,
            type: q.type,
            question: q.question,
            options: q.options,
            fillOptions: q.fillOptions,
            clozeLength:
              q.type === "cloze" && Array.isArray(q.correctAnswer)
                ? (q.correctAnswer as number[]).length
                : undefined,
            correctAnswer: correctAnswerStr,
            source: q.source,
            explanation: q.explanation,
          };
        });

        setQuestions(uiQuestions);
        setApiQuestions(apiQuestions); // 保存 API 題目資料以便提交時使用

        console.log(
          "[QuizPage] 題目載入完成",
          new Date().toISOString(),
          `題數 ${apiQuestions.length}`,
          `耗時 ${(performance.now() - startTime).toFixed(0)} ms`
        );

        setError(null);
      } catch (err: any) {
        console.error("載入題目失敗:", err);
        setError(err.message || "載入題目失敗，請稍後再試");
        // 使用 Mock 資料作為備案
        setQuestions(mockQuestions);

        console.log(
          "[QuizPage] 題目載入失敗，改用備援資料",
          new Date().toISOString()
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [books, difficulty]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = async () => {
    if (currentPage < totalPages) {
      setDirection("forward");
      setCurrentPage((prev) => prev + 1);
      // 滾動到頁面頂部
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // 在最後一頁點擊完成時，檢查是否所有題目都已作答
      const unansweredQuestions: number[] = [];

      questions.forEach((question, index) => {
        const answer = answers[question.id];

        // 檢查答案是否存在且有效
        let isAnswered = false;
        if (question.type === "cloze") {
          const expectedLength =
            question.clozeLength ?? question.options?.length ?? 0;
          const answerArray = Array.isArray(answer)
            ? (answer as string[])
            : [];
          isAnswered = expectedLength > 0 && answerArray.length === expectedLength;
        } else if (Array.isArray(answer)) {
          isAnswered = answer.length > 0;
        } else {
          isAnswered = answer !== undefined && answer !== null && answer !== "";
        }

        if (!isAnswered) {
          unansweredQuestions.push(index + 1); // 題號從 1 開始
        }
      });

      // 如果有未作答的題目，顯示警告
      if (unansweredQuestions.length > 0) {
        const questionNumbers = unansweredQuestions.join("、");
        alert(`第 ${questionNumbers} 題尚未作答，請完成答題後再交卷！`);
        return;
      }

      // 所有題目都已作答，提交測驗
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // 步驟 1: 建立測驗記錄
      const userId = getUserId();
      const apiDifficulty = getDifficultyByKey(difficulty);

      // 對於多本書，使用第一本書作為主要書籍記錄
      const primaryBook =
        books.length > 1
          ? getBookByDisplay(books[0])
          : getBookByDisplay(books[0] || "《神奇西芹汁》");

      console.log("準備建立測驗記錄:", {
        userId,
        book: primaryBook,
        difficulty: apiDifficulty,
        questionCount: apiQuestions.length,
      });

      const createQuizStart = performance.now();
      const quiz = await createQuiz({
        userId,
        book: books.length > 1 ? "綜合" : primaryBook,
        difficulty: apiDifficulty,
        questionIds: apiQuestions.map((q) => q._id),
      });

      console.log("✅ 測驗記錄已建立:", quiz._id, {
        elapsedMs: Math.round(performance.now() - createQuizStart),
      });

      // 步驟 2: 轉換答案格式：從 string/string[] 轉為 index number/number[]
      const submissionAnswers = questions.map((question) => {
        const userAnswer = answers[question.id];
        let convertedAnswer: number | number[] | null = null;

        if (userAnswer !== undefined && userAnswer !== null) {
          if (question.type === "single") {
            // 單選：找到選項的 index
            const index = question.options?.indexOf(userAnswer as string) ?? -1;
            convertedAnswer = index >= 0 ? index : null;
          } else if (question.type === "multiple") {
            // 多選：找到所有選項的 indices
            const selectedOptions = userAnswer as string[];
            convertedAnswer = selectedOptions
              .map((opt) => question.options?.indexOf(opt) ?? -1)
              .filter((idx) => idx >= 0);
          } else if (question.type === "fill") {
            // 填空：找到填空選項的 index
            const index =
              question.fillOptions?.indexOf(userAnswer as string) ?? -1;
            convertedAnswer = index >= 0 ? index : null;
          } else if (question.type === "cloze") {
            const selectedOptions = Array.isArray(userAnswer)
              ? (userAnswer as string[])
              : [];
            convertedAnswer = selectedOptions
              .map((opt) => question.options?.indexOf(opt) ?? -1)
              .filter((idx) => idx >= 0);
          }
        }

        return {
          questionId: question.id,
          userAnswer: convertedAnswer,
        };
      });

      // 步驟 3: 提交答案到 API
      const submitStart = performance.now();
      const result = await submitQuiz(quiz._id, {
        answers: submissionAnswers,
      });

      console.log("測驗提交成功:", {
        quizId: result.quizId,
        elapsedMs: Math.round(performance.now() - submitStart),
      });

      // 將 API 回傳的 answerBitmap 轉換為錯題列表
      const wrongQuestions: Array<{
        question: Question;
        userAnswer: string | string[];
      }> = [];

      // answerBitmap 是 20 個字元的字串，'1' 代表正確，'0' 代表錯誤
      if (result.answerBitmap) {
        result.answerBitmap.split("").forEach((bit, index) => {
          if (bit === "0") {
            // 這題答錯了
            const question = questions[index];
            if (question) {
              const userAnswer = answers[question.id];
              wrongQuestions.push({ question, userAnswer });
            }
          }
        });
      }

      // 傳遞完整結果給 onComplete
      onComplete({
        score: result.correctCount,
        totalQuestions: result.totalQuestions,
        wrongQuestions,
        answers,
      });
    } catch (err) {
      console.error("提交測驗失敗:", err);
      // 提交失敗時，使用本地計算的結果
      const wrongQuestions: Array<{
        question: Question;
        userAnswer: string | string[];
      }> = [];
      let score = 0;

      questions.forEach((question) => {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correctAnswer;

        let isCorrect = false;
        if (question.type === "multiple") {
          const userArr = (userAnswer as string[]) || [];
          const correctArr = (correctAnswer as string[]) || [];
          isCorrect =
            userArr.length === correctArr.length &&
            userArr.every((a) => correctArr.includes(a));
        } else if (question.type === "cloze") {
          const userArr = (userAnswer as string[]) || [];
          const correctArr = (correctAnswer as string[]) || [];
          isCorrect =
            userArr.length === correctArr.length &&
            userArr.every((val, idx) => val === correctArr[idx]);
        } else {
          isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) {
          score++;
        } else {
          wrongQuestions.push({ question, userAnswer });
        }
      });

      onComplete({
        score,
        totalQuestions: questions.length,
        wrongQuestions,
        answers,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setDirection("backward");
      setCurrentPage((prev) => prev - 1);
      // 滾動到頁面頂部
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Loading 狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#FAFAF7] to-[#F7E6C3]/30 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-[#A8CBB7] animate-pulse mx-auto mb-4" />
          <p className="text-[#636e72] text-lg">正在載入題目...</p>
        </div>
      </div>
    );
  }

  // Error 狀態（顯示警告但繼續使用 Mock 資料）
  const showErrorBanner = error && questions.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAFAF7] to-[#F7E6C3]/30 relative overflow-hidden">
      {/* Nature Accents */}
      <NatureAccents variant="minimal" />

      {/* Error Banner */}
      {showErrorBanner && (
        <div className="sticky top-0 z-50 bg-yellow-100 border-b border-yellow-300 px-4 py-2">
          <p className="text-yellow-800 text-sm text-center">
            ⚠️ {error} - 目前使用範例題目
          </p>
        </div>
      )}

      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-[#A8CBB7]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
              <span className="text-[#2d3436]">醫療靈媒測驗</span>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <QuizProgress currentPage={currentPage} totalPages={totalPages} />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-[#636e72] hover:text-[#A8CBB7] hover:bg-[#F7E6C3]/20"
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="container mx-auto px-4 py-8 pb-28">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={{ opacity: 0, x: direction === "forward" ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === "forward" ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            {currentQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <QuestionCard
                  question={question}
                  index={(currentPage - 1) * questionsPerPage + index}
                  userAnswer={answers[question.id]}
                  onAnswerChange={(answer) =>
                    handleAnswerChange(question.id, answer)
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        {/* Navigation Buttons */}
        <div className="fixed bottom-8 right-8 flex gap-3 z-10">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            variant="outline"
            className="
              rounded-full w-12 h-12 p-0
              border-[#A8CBB7] text-[#A8CBB7]
              hover:bg-[#A8CBB7] hover:text-white
              disabled:opacity-30 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl
              transition-all duration-300
            "
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleNext}
            disabled={submitting}
            className="
              rounded-full px-6 h-12
              bg-linear-to-r from-[#A8CBB7] to-[#9fb8a8]
              text-white shadow-lg hover:shadow-xl
              transition-all duration-300
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
              
            "
          >
            {submitting
              ? "提交中..."
              : currentPage === totalPages
              ? "完成"
              : "下一頁"}
            {!submitting && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Page Indicator */}
        <div
          style={{
            position: "fixed",
            bottom: "2rem", // bottom-8
            left: isMobile ? "1rem" : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            zIndex: 40, // 確保不被其他元素遮住
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(6px)",
              padding: "0.5rem 1rem",
              borderRadius: "9999px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                color: "#636e72",
              }}
            >
              第 {currentPage} / {totalPages} 頁
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
