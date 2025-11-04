import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { NatureAccents } from "../components/NatureAccents";
import { ArrowLeft, Trophy, Crown, Medal, Award, Loader2 } from "lucide-react";
import { GradeBadge } from "../components/GradeBadge";
import {
  getAllLeaderboards,
  LeaderboardEntry,
} from "../services/leaderboardService";
import { NaturalPattern } from "../components/NaturalPattern";
import { NatureDecoration } from "../components/NatureDecoration";
import { FloatingHerbs } from "../components/FloatingHerbs";
import { Sparkles } from "lucide-react";
import { useIsMobile } from "../utils/useIsMobile";

interface LeaderboardProps {
  onBack: () => void;
}

const books = [
  { value: "搶救肝臟", label: "搶救肝臟", emoji: "🫀" },
  { value: "神奇西芹汁", label: "神奇西芹汁", emoji: "🥬" },
  { value: "改變生命的食物", label: "改變生命的食物", emoji: "🍎" },
  { value: "綜合", label: "綜合排行", emoji: "🏆" },
];

export function Leaderboard({ onBack }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState("搶救肝臟");
  const [leaderboards, setLeaderboards] = useState<
    Record<string, LeaderboardEntry[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllLeaderboards() {
      try {
        setLoading(true);

        // 使用新的 API 一次取得所有榜單
        const leaderboardMap = await getAllLeaderboards();
        setLeaderboards(leaderboardMap);
      } catch (error) {
        console.error("載入排行榜失敗:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllLeaderboards();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getDifficultyText = (difficulty: string) => {
    const difficultyMap: Record<string, string> = {
      beginner: "初階",
      advanced: "進階",
      初階: "初階",
      進階: "進階",
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-[#E5C17A]" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-[#636e72]">#{rank}</span>
        );
    }
  };

  const { isMobile } = useIsMobile();
  const currentLeaderboard = leaderboards[activeTab] || [];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FAFAF7] via-[#F7E6C3]/20 to-[#A8CBB7]/10 pb-100">
      {/* Background blur effect */}
      <div
        className={`absolute inset-0 opacity-30 ${isMobile ? "hidden" : ""}`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1604248215430-100912b27ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwbmF0dXJlJTIwbGVhdmVzJTIwbGlnaHR8ZW58MXx8fHwxNzYxODA3MjI2fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px)",
        }}
      />

      {/* Nature Decorations */}
      <NaturalPattern />
      {!isMobile && <NatureDecoration />}
      {!isMobile && <FloatingHerbs />}

      {/* 透明頂部列（置中標題） */}
      <div className="relative z-10 bg-transparent pt-100  ">
        <div className="container mx-auto px-4 py-16 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-[#2d3436]">
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
              <span className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse ">
                榮耀排行榜
              </span>
              <Sparkles className="w-6 h-6 text-[#A8CBB7]" />
            </div>
          </div>
          <div className="flex items-center justify-end"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Book Selector - 分離出來放在上方 */}
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-3">
              {books.map((book) => (
                <motion.button
                  key={book.value}
                  onClick={() => setActiveTab(book.value)}
                  className={`
                    relative px-4 py-3 rounded-xl font-medium transition-all duration-300
                    ${
                      activeTab === book.value
                        ? "bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white shadow-lg scale-105"
                        : "bg-white/80 text-[#636e72] hover:bg-[#F7E6C3]/30 border border-[#A8CBB7]/20"
                    }
                  `}
                  whileHover={{ scale: activeTab === book.value ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{book.emoji}</span>
                    <span className="text-sm">{book.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Leaderboard Card */}
          <Card className="border-[#A8CBB7]/20 shadow-xl bg-white/90 backdrop-blur">
            <CardContent className="p-8">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-[#A8CBB7] animate-spin" />
                  <span className="ml-3 text-[#636e72] text-lg">
                    載入排行榜中...
                  </span>
                </div>
              ) : currentLeaderboard.length === 0 ? (
                <div className="py-20 text-center">
                  <Trophy className="w-16 h-16 text-[#A8CBB7]/30 mx-auto mb-4" />
                  <p className="text-[#636e72] text-lg">尚無測驗記錄</p>
                  <p className="text-[#636e72]/60 text-sm mt-2">
                    成為第一個上榜的勇者吧!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentLeaderboard.map((entry, index) => (
                    <motion.div
                      key={`${entry.userId}-${entry.createdAt}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: entry.rank === 1 ? [1, 1.02, 1] : 1,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        scale: {
                          repeat: entry.rank === 1 ? Infinity : 0,
                          duration: 2,
                          ease: "easeInOut",
                        },
                      }}
                      className={`
                        relative flex items-center gap-4 p-4 rounded-xl
                        transition-all duration-300 hover:scale-102
                        ${
                          entry.rank === 1
                            ? "bg-gradient-to-r bg-white/80   from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-400 shadow-2xl shadow-amber-500/50"
                            : entry.rank === 2
                            ? "bg-gradient-to-r bg-white/80 from-slate-100 via-gray-50 to-slate-100 border-2 border-slate-400 shadow-xl shadow-slate-400/40"
                            : entry.rank === 3
                            ? "bg-gradient-to-r bg-white/80 from-orange-100 via-amber-50 to-orange-100 border-2 border-orange-400 shadow-lg shadow-orange-400/30"
                            : "bg-white/80 border border-[#A8CBB7]/10"
                        }
                      `}
                    >
                      {/* Rank Icon */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-[#2d3436] truncate">
                            {entry.displayName}
                          </span>
                          <span
                            className={`
                            px-2 py-0.5 rounded text-xs font-medium
                            ${
                              getDifficultyText(entry.difficulty) === "初階"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                          >
                            {getDifficultyText(entry.difficulty)}
                          </span>
                        </div>
                        <div className="text-sm text-[#636e72] mt-1">
                          {formatDate(entry.createdAt)}
                        </div>
                      </div>

                      {/* Grade Badge */}
                      <div className="flex items-center">
                        <GradeBadge
                          grade={
                            entry.grade as
                              | "S"
                              | "A+"
                              | "A"
                              | "B+"
                              | "B"
                              | "C+"
                              | "F"
                          }
                          size="md"
                        />
                      </div>

                      {/* 第一名：超浮誇特效 */}
                      {entry.rank === 1 && (
                        <>
                          {/* 金色光環脈衝 */}
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            animate={{
                              boxShadow: [
                                "0 0 20px 5px rgba(251, 191, 36, 0.3)",
                                "0 0 40px 10px rgba(251, 190, 36, 0.6)",
                                "0 0 20px 5px rgba(251, 191, 36, 0.3)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          {/* 閃爍光暈 */}
                          <motion.div
                            className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 rounded-xl blur-sm pointer-events-none"
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          {/* 旋轉光線 */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl pointer-events-none"
                            animate={{
                              x: ["-100%", "200%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        </>
                      )}

                      {/* 第二名：絢麗特效 */}
                      {entry.rank === 2 && (
                        <>
                          {/* 銀色光環 */}
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            animate={{
                              boxShadow: [
                                //金色光環
                                // "0 0 20px 5px rgba(251, 191, 36, 0.3)",
                                // "0 0 40px 10px rgba(251, 191, 36, 0.5)",
                                // "0 0 20px 5px rgba(251, 191, 36, 0.3)",
                                //銀色光環
                                "0 0 25px 8px rgba(148, 163, 184, 0.4)",
                                "0 0 50px 15px rgba(99, 141, 199, 0.5)",
                                "0 0 25px 8px rgba(148, 163, 184, 0.4)",
                              ],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          {/* 漸變光暈 */}
                          <motion.div
                            className="absolute -inset-0.5 bg-gradient-to-r from-slate-300 via-gray-200 to-slate-300 rounded-xl blur-sm pointer-events-none"
                            animate={{
                              opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </>
                      )}

                      {/* 第三名：普通特效 */}
                      {entry.rank === 3 && (
                        <>
                          {/* 銅色光環 */}
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            animate={{
                              boxShadow: [
                                //金色光環
                                // "0 0 20px 5px rgba(251, 191, 36, 0.3)",
                                // "0 0 40px 10px rgba(251, 191, 36, 0.5)",
                                // "0 0 20px 5px rgba(251, 191, 36, 0.3)",
                                //銅色光環
                                "0 0 20px 6px rgba(251, 146, 60, 0.3)",
                                "0 0 40px 12px rgba(251, 146, 60, 0.45)",
                                "0 0 20px 6px rgba(251, 146, 60, 0.3)",
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          {/* 溫和光暈 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
                        </>
                      )}
                      {(entry.rank === 4 || entry.rank === 5) && (
                        <>
                          {/* 外層柔光暈 */}
                          <motion.div
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            animate={{
                              boxShadow: [
                                "0 0 15px 3px rgba(255, 255, 255, 0.25)",
                                "0 0 30px 8px rgba(255, 255, 255, 0.68)",
                                "0 0 15px 3px rgba(255, 255, 255, 0.25)",
                              ],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />

                          {/* 內層光暈加厚 */}
                          <motion.div
                            className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/40 to-white/20 rounded-xl blur-sm pointer-events-none"
                            animate={{
                              opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div
        className="flex justify-center pb-20 pt-8 relative z-30 "
        style={{ marginBottom: "80px" }}
      >
        <Button
          onClick={onBack}
          className="px-8 py-6 rounded-2xl cursor-pointer bg-gradient-to-r from-[#A8CBB7] to-[#9fb8a8] text-white shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回首頁
        </Button>
      </div>
    </div>
  );
}
