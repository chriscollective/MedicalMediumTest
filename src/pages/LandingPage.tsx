import React, { useState } from "react";
import { motion } from "motion/react";
import { BookCard } from "../components/BookCard";
import { Button } from "../components/ui/button";
import { NatureDecoration } from "../components/NatureDecoration";
import { FloatingHerbs } from "../components/FloatingHerbs";
import { NaturalPattern } from "../components/NaturalPattern";
import { Sparkles } from "lucide-react";
import { BOOKS } from "../constants/books";
import { useIsMobile } from "../utils/useIsMobile";

interface LandingPageProps {
  onStart: (books: string[], difficulty: "beginner" | "advanced") => void;
  onAdminClick?: () => void;
  onLeaderboardClick?: () => void;
  onAboutClick?: () => void;
  onPrivacyClick?: () => void;
}

export function LandingPage({
  onStart,
  onAdminClick,
  onLeaderboardClick,
  onAboutClick,
  onPrivacyClick,
}: LandingPageProps) {
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"beginner" | "advanced">(
    "beginner"
  );
  const { isMobile } = useIsMobile();

  const books = BOOKS.map((b) => b.display);

  const toggleBook = (book: string) => {
    setSelectedBooks((prev) =>
      prev.includes(book) ? prev.filter((b) => b !== book) : [...prev, book]
    );
  };

  const handleStart = () => {
    if (selectedBooks.length > 0) {
      onStart(selectedBooks, difficulty);
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

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#E5C17A]" />
            <h1 className="text-2xl md:text-3xl text-[#2d3436]">
              醫療靈媒隨堂測驗
            </h1>
            <Sparkles className="w-8 h-8 text-[#E5C17A]" />
          </div>

          <p className="text-[#636e72] text-lg">
            測測你對安東尼療癒知識的理解程度 🌿
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-4xl space-y-8"
        >
          {/* Book Selection */}
          <div className="space-y-4">
            <h3 className="text-center text-[#2d3436]">選擇書籍（可多選）</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {books.map((book, index) => (
                <motion.div
                  key={book}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <BookCard
                    title={book}
                    selected={selectedBooks.includes(book)}
                    onToggle={() => toggleBook(book)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-4">
            <h3 className="text-center text-[#2d3436]">選擇難度</h3>
            <div className="flex justify-center gap-4">
              <Button
                variant={difficulty === "beginner" ? "default" : "outline"}
                onClick={() => setDifficulty("beginner")}
                className={`
                  px-8 py-6 rounded-2xl cursor-pointer transition-all duration-300
                  ${
                    difficulty === "beginner"
                      ? "bg-linear-to-br from-[#A8CBB7] to-[#9fb8a8] text-white shadow-lg hover:shadow-xl"
                      : "border-[#A8CBB7] text-[#2d3436] hover:bg-[#F7E6C3]/20"
                  }
                `}
              >
                初階
              </Button>
              <Button
                variant={difficulty === "advanced" ? "default" : "outline"}
                onClick={() => setDifficulty("advanced")}
                className={`
                  px-8 py-6 rounded-2xl cursor-pointer transition-all duration-300
                  ${
                    difficulty === "advanced"
                      ? "bg-linear-to-r from-[#E5C17A] to-[#d4b86a] text-white shadow-lg hover:shadow-xl"
                      : "border-[#E5C17A] text-[#2d3436] hover:bg-[#F7E6C3]/20"
                  }
                `}
              >
                進階
              </Button>
            </div>
          </div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center pt-8"
          >
            <Button
              onClick={handleStart}
              disabled={selectedBooks.length === 0}
              className="
                px-12 py-8 rounded-3xl cursor-pointer
                bg-linear-to-r from-[#A8CBB7] via-[#9fb8a8] to-[#A8CBB7]
                text-white shadow-2xl
                hover:shadow-[0_0_40px_rgba(168,203,183,0.5)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                relative overflow-hidden
                group
                before:absolute before:inset-0 before:bg-linear-to-r before:from-[#E5C17A]/0 before:via-[#E5C17A]/20 before:to-[#E5C17A]/0
                before:animate-pulse before:opacity-0 hover:before:opacity-100
              "
            >
              <span className="relative z-10 text-xl flex items-center gap-2">
                開始測驗
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center text-sm text-[#636e72] space-x-4"
        >
          <span
            className="hover:text-[#A8CBB7] cursor-pointer transition-colors"
            onClick={onAboutClick}
          >
            關於本站
          </span>
          <span>｜</span>
          <span
            className="hover:text-[#A8CBB7]  cursor-pointer transition-colors"
            onClick={onLeaderboardClick}
          >
            榮耀排行榜
          </span>
          <span>｜</span>
          <span
            className="hover:text-[#A8CBB7] cursor-pointer transition-colors"
            onClick={onPrivacyClick}
          >
            隱私政策
          </span>
          <span>｜</span>
          <span
            className="hover:text-[#A8CBB7] cursor-pointer transition-colors"
            onClick={onAdminClick}
          >
            管理員登入
          </span>
        </motion.footer>
      </div>
    </div>
  );
}
