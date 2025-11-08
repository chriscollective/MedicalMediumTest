import React, { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { GradeBadge } from "../components/GradeBadge";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Card } from "../components/ui/card";
import { NatureAccents } from "../components/NatureAccents";
import { NatureDecoration } from "../components/NatureDecoration";
import { FloatingHerbs } from "../components/FloatingHerbs";
import { NaturalPattern } from "../components/NaturalPattern";
import { Share2, RotateCcw, Home, AlertCircle } from "lucide-react";
import { useIsMobile } from "../utils/useIsMobile";
import { Question } from "../components/QuestionCard";
import { LeaderboardNameDialog } from "../components/LeaderboardNameDialog";
import { ReportIssueDialog } from "../components/ReportIssueDialog";
import {
  checkLeaderboard,
  submitLeaderboard,
} from "../services/leaderboardService";
import { mmTitles, getRandomQuote } from "../data/mmContent";

interface ResultPageProps {
  score: number;
  totalQuestions: number;
  wrongQuestions: Array<{
    question: Question;
    userAnswer: string | string[];
  }>;
  books: string[];
  difficulty: string;
  userId: string;
  onRestart: () => void;
  onHome: () => void;
}

const calculateGrade = (
  percentage: number
): "S" | "A+" | "A" | "B+" | "B" | "C+" | "F" => {
  if (percentage === 100) return "S";
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C+";
  return "F";
};

const gradeMessages = {
  S: "🌟 簡直完美！你已獲得醫療靈媒的真傳，堪稱行走於人間的療癒天使！",
  "A+": "✨ 無比優秀！你已經深入理解安東尼的療癒理念！如同免疫系統的大將軍!",
  A: "🌿 非常好！繼續保持，你在療癒之路上走得很穩！讓我們乾一杯西芹汁!",
  "B+": "💚 很不錯！再多閱讀一些，會有更多收穫！",
  B: "🌱 已認證小粉絲！請保持閱讀與實作，可以持續進步喔！",
  "C+": "📚 需要加油！多花時間理解療癒知識！",
  F: "🌾 不要放棄！可以多翻書，慢慢學習！",
};

export function ResultPage({
  score,
  totalQuestions,
  wrongQuestions,
  books,
  difficulty,
  userId,
  onRestart,
  onHome,
}: ResultPageProps) {
  const percentage = (score / totalQuestions) * 100;
  const grade = calculateGrade(percentage);
  const message = gradeMessages[grade];
  const { isMobile } = useIsMobile();

  // 獲取 MM 稱號和隨機語錄（使用 useMemo 確保語錄在組件生命週期中保持不變）
  const mmTitle = mmTitles[grade];
  const mmQuote = useMemo(() => getRandomQuote(), []);

  const [showLeaderboardDialog, setShowLeaderboardDialog] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // 檢查是否上榜
  useEffect(() => {
    const checkIfQualified = async () => {
      try {
        // 決定書籍類別（單本或綜合）
        let bookCategory = books.length > 1 ? "綜合" : books[0];
        // 移除書名號
        bookCategory = bookCategory.replace(/《|》/g, "");

        const result = await checkLeaderboard(
          userId,
          bookCategory,
          difficulty,
          percentage
        );

        if (result.qualified && result.rank) {
          setLeaderboardRank(result.rank);
          setShowLeaderboardDialog(true);
        }
      } catch (error) {
        console.error("檢查榜單失敗:", error);
      }
    };

    checkIfQualified();
  }, [userId, books, difficulty, percentage]);

  const handleSubmitLeaderboard = async (displayName: string) => {
    try {
      let bookCategory = books.length > 1 ? "綜合" : books[0];
      // 移除書名號
      bookCategory = bookCategory.replace(/《|》/g, "");

      await submitLeaderboard(
        userId,
        bookCategory,
        difficulty,
        percentage,
        displayName
      );

      alert("恭喜！你的成績已成功登上榜單！");
    } catch (error) {
      console.error("提交榜單失敗:", error);
      throw error;
    }
  };

  const handleShare = () => {
    const text = `我在「醫療靈媒隨堂測驗」中獲得了 ${grade} 等級！答對率 ${percentage.toFixed(
      1
    )}% 🌿`;
    if (navigator.share) {
      navigator.share({
        title: "醫療靈媒隨堂測驗",
        text: text,
      });
    } else {
      alert("分享功能在此瀏覽器不支援");
    }
  };

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

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <h1 className="text-[#2d3436]">測驗完成 🌿</h1>

          {/* Grade Badge */}
          <div className="flex justify-center">
            <GradeBadge grade={grade} />
          </div>

          {/* MM Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-[#2d3436] text-3xl font-bold">{mmTitle}</h2>
          </motion.div>

          {/* Score Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-2"
          >
            <p className="text-[#2d3436] text-xl">{message}</p>
            <p className="text-[#636e72]">
              答對 {score} / {totalQuestions} 題
            </p>
          </motion.div>

          {/* MM Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-6 bg-white/40 backdrop-blur-sm border-[#A8CBB7]/30 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="text-3xl text-[#A8CBB7] flex-shrink-0">❝</div>
                <p className="text-[#2d3436] text-lg leading-relaxed italic pt-1">
                  {mmQuote}
                </p>
                <div className="text-3xl text-[#A8CBB7] flex-shrink-0 self-end">
                  ❞
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Button
              onClick={handleShare}
              variant="outline"
              className="
                border-[#E5C17A] text-[#E5C17A]
                hover:bg-[#E5C17A] hover:text-white
                rounded-xl px-6
                transition-all duration-300
              "
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享到 Facebook
            </Button>
            <Button
              onClick={onRestart}
              className="
                bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8]
                text-white rounded-xl px-6
                hover:shadow-lg
                transition-all duration-300
              "
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新挑戰
            </Button>
            <Button
              onClick={onHome}
              variant="outline"
              className="
                        bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8]
                text-white rounded-xl px-6
                hover:shadow-lg
                transition-all duration-300
              "
            >
              <Home className="w-4 h-4 mr-2" />
              回首頁
            </Button>
            <Button
              onClick={() => setShowReportDialog(true)}
              variant="outline"
              className="
                     bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8]
                text-white rounded-xl px-6
                hover:shadow-lg
                transition-all duration-300
              "
            >
              問題回報
            </Button>
          </motion.div>

          {/* Wrong Questions Analysis */}
          {wrongQuestions && wrongQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="max-w-3xl mx-auto mt-12"
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-[#A8CBB7]/20">
                <h3 className="text-[#2d3436] mb-4">錯題解析 📝</h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {wrongQuestions.map((item, index) => {
                    const userAnswerStr = Array.isArray(item.userAnswer)
                      ? item.userAnswer.join(", ")
                      : item.userAnswer;
                    const correctAnswerStr = Array.isArray(
                      item.question.correctAnswer
                    )
                      ? item.question.correctAnswer.join(", ")
                      : item.question.correctAnswer;

                    return (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-[#A8CBB7]/20"
                      >
                        <AccordionTrigger className="hover:no-underline hover:bg-[#F7E6C3]/20 px-4 rounded-lg transition-colors">
                          <span className="text-left">
                            Q: {item.question.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-4 space-y-3">
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-[#636e72]">你的答案：</span>
                              <span className="text-red-500 ml-2">
                                {userAnswerStr || "未作答"}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="text-[#636e72]">正確答案：</span>
                              <span className="text-[#A8CBB7] ml-2">
                                {correctAnswerStr}
                              </span>
                            </p>
                            {item.question.source && (
                              <p className="text-xs text-[#636e72]">
                                出處：{item.question.source}
                              </p>
                            )}
                            {item.question.explanation && (
                              <div className="mt-3 p-3 bg-[#F7E6C3]/30 rounded-lg">
                                <p className="text-sm text-[#2d3436]">
                                  💡 {item.question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Leaderboard Name Dialog */}
      <LeaderboardNameDialog
        open={showLeaderboardDialog}
        rank={leaderboardRank}
        onSubmit={handleSubmitLeaderboard}
        onClose={() => setShowLeaderboardDialog(false)}
      />

      {/* Report Issue Dialog */}
      <ReportIssueDialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
      />
    </div>
  );
}
