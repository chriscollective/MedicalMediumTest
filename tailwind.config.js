/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // 自訂斷點：1024px 及以下使用手機版排版
    screens: {
      'sm': '640px',
      'md': '1025px',  // 平板也使用手機版（原本 768px）
      'lg': '1280px',
      'xl': '1536px',
      '2xl': '1920px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  safelist: [
    // 數據分析 - 深綠色
    "from-[#A8CBB7]",
    "to-[#9fb8a8]",
    // 題庫管理 - 金黃色
    "from-[#E5C17A]",
    "to-[#d4b86a]",
    // 管理員設定 - 灰黑色
    "from-[#636e72]",
    "to-[#2d3436]",
    // 題庫管理 -
    "from-[#F8E9C9]",
    "to-[#EBDDBF]",
    // GradeBadge 漸變色（完整類名組合）
    "from-[#E5C17A]",
    "via-[#f4d89e]",
    "to-[#E5C17A]",
    "from-[#F7E6C3]",
    "to-[#e8d9b5]",
    "from-[#F8E9C9]",
    "to-[#EBDDBF]",
    "from-[#A8CBB7]",
    "via-[#c5dccf]",
    "to-[#9fb8a8]",
    // GradeBadge 陰影和光環
    "shadow-[0_0_40px_rgba(229,193,122,0.6)]",
    "shadow-[0_0_20px_rgba(247,230,195,0.4)]",
    "shadow-[0_0_30px_rgba(168,203,183,0.5)]",
    "shadow-[0_0_25px_rgba(168,203,183,0.4)]",
    "ring-4",
    "ring-3",
    "ring-2",
    "ring-1",
    "ring-[#E5C17A]/30",
    "ring-[#F7E6C3]/25",
    "ring-[#A8CBB7]/30",
    "ring-[#A8CBB7]/25",
    "ring-gray-200",
    "ring-gray-300/50",
    "ring-gray-400/30",
  ],
  plugins: [require("tailwindcss-animate")],
};
