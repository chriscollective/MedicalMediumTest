import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface GradeBadgeProps {
  grade: "S" | "A+" | "A" | "B+" | "B" | "C+" | "F";
}

export function GradeBadge({ grade }: GradeBadgeProps) {
  // 檢測是否為移動設備（簡單版本）
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 使用 inline style 來設定漸變背景（繞過 Tailwind 編譯問題）
  const getBadgeStyle = (): React.CSSProperties => {
    const size = isMobile ? "6rem" : "10rem"; // 手機 96px, 桌面 160px
    const baseStyle: React.CSSProperties = {
      width: size,
      height: size,
      borderRadius: "9999px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    };

    switch (grade) {
      case "S":
        return {
          ...baseStyle,
          backgroundImage:
            "linear-gradient(to bottom right, #E5C17A, #f4d89e, #E5C17A)",
          boxShadow:
            "0 0 40px rgba(229, 193, 122, 0.6), 0 0 0 4px rgba(229, 193, 122, 0.3)",
        };
      case "A+":
        return {
          ...baseStyle,
          backgroundImage: "linear-gradient(to bottom right, #F7E6C3, #e8d9b5)",
          boxShadow:
            "0 0 20px rgba(247, 230, 195, 0.4), 0 0 0 3px rgba(247, 230, 195, 0.25)",
        };
      case "A":
        return {
          ...baseStyle,
          backgroundImage: "linear-gradient(to bottom right, #F7E6C3, #e8d9b5)",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(242, 243, 162, 0.3)",
        };
      case "B+":
        return {
          ...baseStyle,
          backgroundImage:
            "linear-gradient(to bottom right, #A8CBB7, #c5dccf, #A8CBB7)",
          boxShadow:
            "0 0 30px rgba(168, 203, 183, 0.5), 0 0 0 4px rgba(168, 203, 183, 0.3)",
        };
      case "B":
        return {
          ...baseStyle,
          backgroundImage: "linear-gradient(to bottom right, #A8CBB7, #9fb8a8)",
          boxShadow:
            "0 0 25px rgba(168, 203, 183, 0.4), 0 0 0 3px rgba(168, 203, 183, 0.25)",
        };
      case "C+":
        return {
          ...baseStyle,
          backgroundImage: "linear-gradient(to bottom right, #e5e7eb, #d1d5db)",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 2px rgba(209, 213, 219, 0.5)",
        };
      case "F":
        return {
          ...baseStyle,
          backgroundImage: "linear-gradient(to bottom right, #d1d5db, #9ca3af)",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(156, 163, 175, 0.3)",
        };
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }}
      className="relative"
    >
      {/* Floating sparkles for S and A+ grades */}
      {(grade === "S" || grade === "A+") && (
        <>
          <motion.div
            className="absolute -top-4 md:-top-6 -left-4 md:-left-6"
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-[#E5C17A]" />
          </motion.div>
          <motion.div
            className="absolute -top-4 md:-top-6 -right-4 md:-right-6"
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-[#A8CBB7]" />
          </motion.div>
          <motion.div
            className="absolute -bottom-4 md:-bottom-6 left-1/2 transform -translate-x-1/2"
            animate={{
              y: [0, 10, 0],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-[#F7E6C3]" />
          </motion.div>
        </>
      )}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={getBadgeStyle()}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to top, rgba(255, 255, 255, 0.2), transparent)",
          }}
        />
        <span
          style={{
            position: "relative",
            zIndex: 10,
            color: "white",
            filter: "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))",
            fontWeight: 800,
            fontSize: isMobile ? "1.875rem" : "3.75rem", // 手機 3xl (30px), 桌面 6xl (60px)
          }}
        >
          {grade}
        </span>
      </motion.div>
    </motion.div>
  );
}
