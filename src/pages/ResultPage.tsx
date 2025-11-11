import React, { useEffect, useState, useMemo, useRef } from "react";
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
import html2canvas from "html2canvas";
import { Question } from "../components/QuestionCard";
import { LeaderboardNameDialog } from "../components/LeaderboardNameDialog";
import { ReportIssueDialog } from "../components/ReportIssueDialog";
import {
  checkLeaderboard,
  submitLeaderboard,
} from "../services/leaderboardService";
import {
  mmTitlesDesktop,
  mmTitlesMobile,
  getRandomQuote,
} from "../data/mmContent";

interface ResultPageProps {
  quizId: string; // 🔒 新增：測驗 ID（用於安全驗證排行榜）
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
  "B+": "💚 很不錯！已經有穩地的基礎了，再多閱讀一些，會有更多收穫！",
  B: "🌱 已認證小粉絲！請保持閱讀與實作，可以持續進步喔！",
  "C+": "📚 你已向療癒往前了幾步！可以再花時間理解療癒知識。",
  F: "🌾 不要放棄！你已踏入MM的世界，可以多翻書，慢慢學習！",
};

export function ResultPage({
  quizId, // 🔒 接收 quizId
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
  const mmTitle = isMobile ? mmTitlesMobile[grade] : mmTitlesDesktop[grade];
  const mmQuote = useMemo(() => getRandomQuote(), []);

  // 隨機選擇 4 個 FloatingHerbs（使用 useMemo 確保每次渲染保持一致）
  const randomHerbs = useMemo(() => {
    // 將 herbs 分成 4 個區域，確保選中的不會太近
    const regions = {
      topLeft: [
        { emoji: "🌿", position: { top: "10%", left: "5%" } },
        { emoji: "🌱", position: { top: "15%", left: "8%" } },
      ],
      topRight: [
        { emoji: "🍃", position: { top: "10%", right: "8%" } },
        { emoji: "🥬", position: { top: "15%", right: "5%" } },
      ],
      bottomLeft: [
        { emoji: "🫐", position: { bottom: "15%", left: "8%" } },
        { emoji: "🌸", position: { bottom: "10%", left: "5%" } },
      ],
      bottomRight: [
        { emoji: "🍋", position: { bottom: "15%", right: "10%" } },
        { emoji: "🌺", position: { bottom: "10%", right: "6%" } },
      ],
    };

    // 從每個區域隨機選一個
    const selected = [];
    for (const region of Object.values(regions)) {
      const randomIndex = Math.floor(Math.random() * region.length);
      selected.push(region[randomIndex]);
    }

    return selected;
  }, []);

  const [showLeaderboardDialog, setShowLeaderboardDialog] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 用於截圖的隱藏區域 ref
  const shareImageRef = useRef<HTMLDivElement>(null);

  // 檢查是否上榜（只有當 quizId 存在時才能上榜）
  useEffect(() => {
    const checkIfQualified = async () => {
      // 🔒 沒有 quizId 表示測驗沒有成功提交到後端，無法上榜
      if (!quizId) {
        console.log("⚠️ 無 quizId，無法檢查榜單");
        return;
      }

      try {
        const result = await checkLeaderboard(quizId);

        if (result.qualified && result.rank) {
          setLeaderboardRank(result.rank);
          setShowLeaderboardDialog(true);
        }
      } catch (error) {
        console.error("檢查榜單失敗:", error);
      }
    };

    checkIfQualified();
  }, [quizId]); // 依賴改為 quizId

  const handleSubmitLeaderboard = async (displayName: string) => {
    // 🔒 沒有 quizId 無法提交榜單
    if (!quizId) {
      throw new Error("無法提交榜單：測驗資料異常");
    }

    try {
      await submitLeaderboard(quizId, displayName);
      alert("恭喜！你的成績已成功登上榜單！");
    } catch (error) {
      console.error("提交榜單失敗:", error);
      throw error;
    }
  };

  const handleShare = async () => {
    if (!shareImageRef.current) {
      alert("無法生成分享圖片，請稍後再試");
      return;
    }

    try {
      setIsGeneratingImage(true);

      // 使用 html2canvas 將隱藏的截圖區域轉換成圖片
      const canvas = await html2canvas(shareImageRef.current, {
        backgroundColor: "#FAFAF7",
        scale: 2, // 提高解析度
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // 將 canvas 轉換成 blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/png");
      });

      const file = new File([blob], "medical-medium-quiz-result.png", {
        type: "image/png",
      });

      const shareText = `我在「醫療靈媒隨堂測驗」中獲得了 ${grade} 等級！答對率 ${percentage.toFixed(
        1
      )}% 🌿`;

      // 方案 1: 使用 Web Share API 分享圖片（僅在行動裝置上啟用）
      if (
        isMobile &&
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: "醫療靈媒隨堂測驗",
            text: shareText,
            files: [file],
          });
          setIsGeneratingImage(false);
          return;
        } catch (err) {
          if (err instanceof Error && err.name !== "AbortError") {
            console.log("Web Share API 分享失敗:", err);
          }
        }
      }

      const downloadImage = (blobToDownload: Blob) => {
        const url = URL.createObjectURL(blobToDownload);
        const link = document.createElement("a");
        link.href = url;
        link.download = "medical-medium-quiz-result.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      // 方案 2: 桌面版 - 複製圖片到剪貼簿並依使用者選擇開啟 Facebook 或下載
      let copiedToClipboard = false;

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const clipboardItem = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([clipboardItem]);
          copiedToClipboard = true;
        }
      } catch (clipboardErr) {
        console.log("複製到剪貼簿失敗（部分瀏覽器不支援）:", clipboardErr);
      }

      if (!copiedToClipboard) {
        const shouldDownload = confirm(
          "⚠️ 瀏覽器無法自動複製到剪貼簿。\n\n按「確定」下載圖片到本機，按「取消」將開啟 Facebook 首頁。"
        );

        if (shouldDownload) {
          downloadImage(blob);
        } else {
          window.open("https://www.facebook.com/", "_blank");
        }
        return;
      }

      const shouldOpenFB = confirm(
        "✅ 成績截圖已複製到剪貼簿！\n\n是否要立即開啟 Facebook 首頁？\n按「確定」開啟 Facebook，按「取消」則下載圖片到本機。"
      );

      if (shouldOpenFB) {
        window.open("https://www.facebook.com/", "_blank");
      } else {
        downloadImage(blob);
      }
    } catch (err) {
      console.error("生成分享圖片失敗:", err);
      alert("生成分享圖片失敗，請稍後再試");
    } finally {
      setIsGeneratingImage(false);
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
      {/* 隱藏的截圖區域 - 使用內聯樣式避免 oklab 顏色問題 */}
      <div
        ref={shareImageRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "600px",
          padding: "48px 32px",
          background:
            "linear-gradient(135deg, #FAFAF7 0%, rgba(247, 230, 195, 0.3) 50%, rgba(168, 203, 183, 0.15) 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* 內容容器 - 相對定位以便 herbs 可以正確定位 */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* 靜態背景裝飾 - FloatingHerbs (隨機 4 個) */}
          {randomHerbs.map((herb, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                ...herb.position,
                fontSize: "48px",
                opacity: 0.3 + (index % 2) * 0.05,
                zIndex: 0,
              }}
            >
              {herb.emoji}
            </div>
          ))}

          {/* 標題 */}
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2d3436",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            測驗完成 🌿
          </h1>

          {/* 獎章 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background:
                  grade === "S"
                    ? "linear-gradient(135deg, #E5C17A, #f4d89e, #E5C17A)"
                    : grade === "A+"
                    ? "linear-gradient(135deg, #F7E6C3, #e8d9b5)"
                    : grade === "A"
                    ? "linear-gradient(135deg, #F7E6C3, #e8d9b5)"
                    : grade === "B+"
                    ? "linear-gradient(135deg, #A8CBB7, #c5dccf, #A8CBB7)"
                    : grade === "B"
                    ? "linear-gradient(135deg, #A8CBB7, #9fb8a8)"
                    : grade === "C+"
                    ? "linear-gradient(135deg, #e5e7eb, #d1d5db)"
                    : "linear-gradient(135deg, #d1d5db, #9ca3af)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "72px",
                fontWeight: "bold",
                color: "white",
                boxShadow:
                  grade === "S"
                    ? "0 0 40px rgba(229, 193, 122, 0.6), 0 0 0 4px rgba(229, 193, 122, 0.3)"
                    : grade === "A+"
                    ? "0 0 20px rgba(247, 230, 195, 0.4), 0 0 0 3px rgba(247, 230, 195, 0.25)"
                    : grade === "A"
                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(242, 243, 162, 0.3)"
                    : grade === "B+"
                    ? "0 0 30px rgba(168, 203, 183, 0.5), 0 0 0 4px rgba(168, 203, 183, 0.3)"
                    : grade === "B"
                    ? "0 0 25px rgba(168, 203, 183, 0.4), 0 0 0 3px rgba(168, 203, 183, 0.25)"
                    : grade === "C+"
                    ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 2px rgba(209, 213, 219, 0.5)"
                    : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(156, 163, 175, 0.3)",
                lineHeight: "1",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: "translateY(-30px)",
                }}
              >
                {grade}
              </span>
            </div>
          </div>

          {/* MM 稱號 */}
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#2d3436",
              textAlign: "center",
              marginBottom: "24px",
              lineHeight: "1.4",
            }}
            dangerouslySetInnerHTML={{ __html: mmTitle }}
          />

          {/* 分數資訊 */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p
              style={{
                fontSize: "20px",
                color: "#2d3436",
                marginBottom: "8px",
              }}
            >
              {message}
            </p>
            <p style={{ fontSize: "16px", color: "#636e72" }}>
              答對 {score} / {totalQuestions} 題
            </p>
          </div>

          {/* MM 語錄 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "2px solid rgba(168, 203, 183, 0.4)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "32px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
            >
              <div
                style={{ fontSize: "32px", color: "#A8CBB7", flexShrink: 0 }}
              >
                ❝
              </div>
              <p
                style={{
                  fontSize: "18px",
                  lineHeight: "1.8",
                  fontStyle: "italic",
                  color: "#2d3436",
                  margin: 0,
                  paddingTop: "4px",
                  flex: 1,
                }}
              >
                {mmQuote}
              </p>
              <div
                style={{
                  fontSize: "32px",
                  color: "#A8CBB7",
                  flexShrink: 0,
                  alignSelf: "flex-end",
                }}
              >
                ❞
              </div>
            </div>
          </div>

          {/* 網站標記 */}
          <div
            style={{
              borderTop: "2px solid rgba(168, 203, 183, 0.3)",
              paddingTop: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "#636e72", margin: 0 }}>
              醫療靈媒隨堂測驗
            </p>
          </div>
        </div>{" "}
        {/* 結束內容容器 */}
      </div>{" "}
      {/* 結束隱藏截圖區域 */}
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
            <h2
              className="text-[#2d3436] text-3xl font-bold"
              dangerouslySetInnerHTML={{ __html: mmTitle }}
            />
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
                <p
                  className="text-[#2d3436] text-lg leading-relaxed pt-1"
                  style={{ fontStyle: "italic" }}
                >
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
              disabled={isGeneratingImage}
              variant="outline"
              className="
                border-[#E5C17A] text-white
                bg-[#E5C17A]
                hover:text 
                hover:shadow-lg
             
                rounded-xl px-6
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isGeneratingImage ? "生成圖片中..." : "分享到FaceBook"}
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
