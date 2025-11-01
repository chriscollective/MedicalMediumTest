# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個針對醫療靈媒書籍的測驗應用程式，使用 React、TypeScript 和 Vite 建構。應用程式採用自然主題的 UI 設計並搭配動畫效果，允許使用者根據選擇的書籍和難度進行測驗，並提供管理後台用於管理題目和查看分析數據。

## 開發指令

**安裝依賴套件：**
```bash
npm i
```

**啟動開發伺服器：**
```bash
npm run dev
```
開發伺服器運行在 3000 端口，並會自動在瀏覽器中開啟。

**建構生產版本：**
```bash
npm run build
```
輸出目錄為 `build/`（在 vite.config.ts 中配置）。

## 應用程式架構

### 狀態管理與路由

這是一個**單頁應用程式（SPA），採用手動頁面路由**。主要的 App.tsx 組件使用 `useState` 和條件渲染來管理所有導航狀態，而不是使用路由庫。

- **App.tsx**：中央狀態管理器和頁面路由器
  - 使用 `currentPage` 狀態控制渲染哪個頁面組件
  - 維護 `quizState` 用於測驗數據（書籍、難度、答案、分數）
  - 處理 7 個頁面之間的導航：landing、quiz、result、admin-login、admin-dashboard、analytics、questions
  - **重要**：所有頁面轉換都通過 App.tsx 的回調處理函數進行

### 頁面組件結構

位於 `src/pages/`：

- **LandingPage**：書籍選擇（可多選）和難度選擇器（初階/進階）
- **QuizPage**：分頁測驗介面（每頁 5 題，共 4 頁 = 20 題）
  - 使用 AnimatePresence 實現帶方向性的頁面轉場動畫
  - 題目在 generateMockQuestions() 中本地管理
- **ResultPage**：分數顯示和錯題回顧
- **AdminLogin**：簡易管理員登入
- **AdminDashboard**：管理員選單中心
- **Analytics**：測驗統計（佔位符）
- **QuestionBank**：題目管理介面（佔位符）

### 題目系統

題目由 `src/components/QuestionCard.tsx` 中的 `Question` 介面定義：

```typescript
interface Question {
  id: string;
  type: 'single' | 'multiple' | 'fill';
  question: string;
  options?: string[];          // 用於單選/多選題
  fillOptions?: string[];      // 用於填空題
  correctAnswer: string | string[];
  source?: string;             // 書籍來源
  explanation?: string;
}
```

**題目類型：**
1. **single**：單選按鈕（一個答案）
2. **multiple**：複選框（多個正確答案）
3. **fill**：點擊選擇填空（顯示為徽章）

**模擬數據**：目前題目硬編碼在：
- App.tsx（第 33-196 行）：用於分數計算
- QuizPage.tsx（第 17-186 行）：用於渲染測驗

這些應該同步或重構到共享來源。

### UI 組件

專案使用 **shadcn/ui 組件**（Radix UI + Tailwind CSS）：
- 位於 `src/components/ui/`
- 預配置了完整的 Radix UI 組件庫
- 自訂的自然主題組件：
  - **NatureDecoration**：裝飾性植物/草本 SVG 元素
  - **FloatingHerbs**：浮動動畫元素
  - **NaturalPattern**：背景圖案疊加
  - **NatureAccents**：簡化的裝飾元素

### 設計系統

**色彩配置**（自然風格）：
- 主要綠色：`#A8CBB7`（鼠尾草綠）
- 強調金色：`#E5C17A`（暖米金色）
- 背景色：`#FAFAF7`（灰白色）
- 次要色：`#F7E6C3`（淺奶油色）
- 文字色：`#2d3436`（深灰）、`#636e72`（中灰）

**動畫庫**：使用 `motion/react`（Framer Motion）實現：
- 使用 AnimatePresence 的頁面轉場
- 交錯列表動畫
- 懸停效果和微交互

### 路徑別名

在 vite.config.ts 中配置：
- `@/` 對應到 `src/`
- 所有 Radix UI 和其他依賴項都有版本特定的別名

## 重要實作細節

### 分數計算邏輯

位於 App.tsx 的 `handleQuizComplete` 函數：
- **單選/填空題**：直接字串比較
- **多選題**：陣列長度相等 + 所有元素匹配（順序無關）
- 錯誤答案會與題目引用和使用者答案一起儲存以供回顧

### 測驗分頁

QuizPage 每頁顯示 5 題，包含：
- 前進/後退導航與動畫轉場
- 進度指示器（固定在頂部）
- 右下角浮動操作按鈕
- 中央頁碼計數器

### 管理員流程

管理員驗證**不安全**（佔位符實作）：
- AdminLogin 中沒有密碼驗證
- 沒有後端驗證
- 使用者名稱儲存在 App.tsx 狀態中

## 技術堆疊

- **React 18** with TypeScript
- **Vite 6** 使用 SWC 進行快速建構
- **Tailwind CSS** 用於樣式
- **Radix UI** 用於無障礙 UI 基礎元件
- **Framer Motion**（`motion/react`）用於動畫
- **Lucide React** 用於圖示
- **React Hook Form** + **Recharts**（已安裝但尚未明顯使用）

## 原始設計參考

此專案是從 Figma 設計生成的，可在以下位置查看：
https://www.figma.com/design/a3i2fvV92IFl19Lom9aKXH/醫療靈媒隨堂測驗介面設計

## Active Technologies
- MongoDB Atlas (雲端托管) (001-database-question-bank)

## Recent Changes
- 001-database-question-bank: Added MongoDB Atlas (雲端托管)
