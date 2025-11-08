import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QuestionCard, Question } from "../components/QuestionCard";
import { QuizProgress } from "../components/QuizProgress";
import { Button } from "../components/ui/button";
import { NatureAccents } from "../components/NatureAccents";
import { NatureDecoration } from "../components/NatureDecoration";
import { FloatingHerbs } from "../components/FloatingHerbs";
import { NaturalPattern } from "../components/NaturalPattern";
import { ChevronLeft, ChevronRight, Home, Pause, Sparkles } from "lucide-react";
import { useIsMobile } from "../utils/useIsMobile";
import {
  fetchQuizQuestions,
  fetchMixedQuizQuestions,
} from "../services/questionService";
import { createQuiz, submitQuiz } from "../services/quizService";
import { getUserId } from "../utils/userStorage";
import { Question as ApiQuestion } from "../types/question";
import { getBookByDisplay, getDifficultyByKey } from "../constants/books";

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
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[]>([]);
  const { isMobile } = useIsMobile();

  // 自動重試函數
  const fetchWithRetry = async (
    fetchFn: () => Promise<ApiQuestion[]>,
    maxRetries = 2
  ): Promise<ApiQuestion[]> => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fetchFn();
      } catch (error) {
        console.log(`[QuizPage] 嘗試 ${i + 1}/${maxRetries + 1} 失敗`);
        if (i === maxRetries) {
          throw error; // 最後一次重試失敗，拋出錯誤
        }
        // 等待後重試（第一次 1 秒，第二次 2 秒）
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 1000));
        console.log(`[QuizPage] 等待 ${i + 1} 秒後重試...`);
      }
    }
    throw new Error("Retry failed"); // TypeScript 要求的返回
  };

  // 載入題目
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setConnectionError(false);
        setError(null);

        const startTime = performance.now();
        console.log("[QuizPage] 開始載入測驗題目", new Date().toISOString());

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

          apiQuestions = await fetchWithRetry(() =>
            fetchMixedQuizQuestions(dbBooks, apiDifficulty)
          );
        } else {
          // 單本書，使用原本的邏輯
          const bookDisplay = books[0] || "《神奇西芹汁》";
          const book = getBookByDisplay(bookDisplay);
          console.log("📚 準備載入單本書題目:", {
            book,
            difficulty: apiDifficulty,
          });

          apiQuestions = await fetchWithRetry(() =>
            fetchQuizQuestions(book, apiDifficulty)
          );
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
        console.error("載入題目失敗（所有重試都失敗）:", err);
        setConnectionError(true);
        setError(err.message || "無法連接到伺服器");
        console.log(
          "[QuizPage] 題目載入失敗（所有重試都失敗）",
          new Date().toISOString()
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [books, difficulty]);

  // 手動重試函數
  const handleRetry = () => {
    setConnectionError(false);
    setError(null);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
    // 觸發 useEffect 重新載入
    window.location.reload();
  };

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
          const answerArray = Array.isArray(answer) ? (answer as string[]) : [];
          isAnswered =
            expectedLength > 0 && answerArray.length === expectedLength;
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
      <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-[#FAFAF7] via-[#F7E6C3]/20 to-[#A8CBB7]/10">
        {/* Background blur effect (disabled on mobile) */}
        {!isMobile && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1604248215430-100912b27ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwbmF0dXJlJTIwbGVhdmVzJTIwbGlnaHR8ZW58MXx8fHwxNzYxODA3MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(60px)",
            }}
          />
        )}

        {/* Nature Decorations */}
        <NaturalPattern />
        {!isMobile && <NatureDecoration />}
        <FloatingHerbs />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-[#A8CBB7] animate-pulse mx-auto mb-4" />
            <p className="text-[#636e72] text-lg">正在載入題目...</p>
          </div>
        </div>
      </div>
    );
  }

  // 連線錯誤頁面（類似 ResultPage 風格）
  if (connectionError) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-[#FAFAF7] via-[#F7E6C3]/20 to-[#A8CBB7]/10">
        {/* Background blur effect (disabled on mobile) */}
        {!isMobile && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1604248215430-100912b27ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwbmF0dXJlJTIwbGVhdmVzJTIwbGlnaHR8ZW58MXx8fHwxNzYxODA3MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(60px)",
            }}
          />
        )}

        {/* Nature Decorations */}
        <NaturalPattern />
        {!isMobile && <NatureDecoration />}
        <FloatingHerbs />

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* 錯誤卡片 */}
            <div
              className="bg-white/60 rounded-3xl shadow-2xl p-8 md:p-12 text-center"
              style={{
                border: "3px solid #A8CBB7",
                boxShadow: "0 20px 60px rgba(168, 203, 183, 0.3)",
              }}
            >
              {/* 錯誤圖示 */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  backgroundColor: "#F7E6C3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  border: "3px solid #A8CBB7",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A8CBB7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              {/* 錯誤標題 */}
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "#fe9882" }}
              >
                資料庫連線失敗
              </h2>

              {/* 錯誤訊息 */}
              <p
                className="text-lg mb-6"
                style={{ color: "#636e72", lineHeight: "1.8" }}
              >
                {error || "無法連接到伺服器，請檢查您的網路連線"}
              </p>

              {/* MM 語錄風格的提示 */}
              <div
                className="bg-gradient-to-r from-[#F7E6C3] to-[#E5C17A] rounded-2xl p-6 mb-8"
                style={{ border: "2px solid #E5C17A" }}
              >
                <p
                  className="text-base italic"
                  style={{ color: "#2d3436", lineHeight: "1.8" }}
                >
                  💡 <strong>提示：</strong>
                  <br />
                  伺服器連線異常，可能是伺服器尚未啟動或網路連線異常。
                  <br />
                  請確認網路連線正常後，點擊下方按鈕重新載入測驗。
                  <br />
                  如果問題持續發生，請稍後再試。
                </p>
              </div>

              {/* 按鈕 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleRetry}
                  size="lg"
                  className="bg-[#A8CBB7] hover:bg-[#8FB0A0] text-white px-8 py-6 text-lg rounded-xl"
                >
                  重新載入資料
                </Button>
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#A8CBB7] text-[#A8CBB7] hover:bg-[#F7E6C3]/30 px-8 py-6 text-lg rounded-xl"
                >
                  返回首頁
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-[#FAFAF7] via-[#F7E6C3]/20 to-[#A8CBB7]/10">
      {/* Background blur effect (disabled on mobile) */}
      {!isMobile && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1604248215430-100912b27ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwbmF0dXJlJTIwbGVhdmVzJTIwbGlnaHR8ZW58MXx8fHwxNzYxODA3MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px)",
          }}
        />
      )}

      {/* Nature Decorations */}
      <NaturalPattern />
      {!isMobile && <NatureDecoration />}
      <FloatingHerbs />

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
