---
name: ui-design-system
description: 醫療靈媒測驗系統的 UI 設計規範，包含色彩系統、字體、間距、動畫、組件使用指南。確保所有新介面和元件遵循統一的自然主題設計風格。關鍵字：設計、UI、元件、顏色、樣式、介面、主題
---

# UI 設計系統 Skill

此 Skill 定義醫療靈媒測驗系統的**視覺設計規範**，確保整個應用程式的視覺一致性。

## 🎯 使用時機

當需要：
- 建立新的 UI 介面或元件
- 調整現有元件的樣式
- 確保設計一致性
- 選擇顏色、字體或間距

## 🎨 色彩系統

### 主要色彩

```css
/* 品牌主色 */
--primary: #A8CBB7          /* 鼠尾草綠 - 按鈕、連結、重點元素 */
--primary-hover: #96B9A5    /* 鼠尾草綠（hover 狀態） */

/* 強調色 */
--accent: #E5C17A           /* 暖米金色 - 強調、高亮、特殊狀態 */
--accent-hover: #D9B368     /* 暖米金色（hover 狀態） */

/* 背景色 */
--background: #FAFAF7       /* 灰白色 - 頁面主背景 */
--surface: #FFFFFF          /* 純白 - 卡片、容器背景 */
--secondary-bg: #F7E6C3     /* 淺奶油色 - 次要區塊背景 */

/* 文字色彩 */
--text-primary: #2d3436     /* 深灰 - 主要文字 */
--text-secondary: #636e72   /* 中灰 - 次要文字、說明文字 */
--text-disabled: #b2bec3    /* 淺灰 - 禁用狀態文字 */

/* 狀態色彩 */
--success: #00b894          /* 成功、正確答案 */
--error: #d63031            /* 錯誤、錯誤答案 */
--warning: #fdcb6e          /* 警告 */
--info: #74b9ff             /* 資訊提示 */
```

### Tailwind CSS 對應

```typescript
// 背景
bg-[#FAFAF7]       // 頁面背景
bg-white           // 卡片背景
bg-[#F7E6C3]       // 次要背景

// 文字
text-[#2d3436]     // 主要文字
text-[#636e72]     // 次要文字
text-[#b2bec3]     // 禁用文字

// 邊框
border-[#A8CBB7]   // 主色邊框
border-[#E5C17A]   // 強調邊框
```

---

## 📝 字體系統

### 字體家族

```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
               "Noto Sans TC", "Microsoft JhengHei", sans-serif;
```

### 字體大小

```css
--text-xs: 12px      /* 極小文字（標籤、提示） */
--text-sm: 14px      /* 小文字（次要資訊） */
--text-base: 16px    /* 基礎文字（正文） */
--text-lg: 18px      /* 大文字（小標題） */
--text-xl: 20px      /* 特大文字 */
--text-2xl: 24px     /* 標題 */
--text-3xl: 30px     /* 大標題 */
--text-4xl: 36px     /* 超大標題 */
```

### Tailwind CSS 對應

```typescript
text-xs    // 12px
text-sm    // 14px
text-base  // 16px
text-lg    // 18px
text-xl    // 20px
text-2xl   // 24px
text-3xl   // 30px
text-4xl   // 36px
```

---

## 📏 間距系統

### 標準間距

```css
--space-1: 4px       /* 極小間距 */
--space-2: 8px       /* 小間距 */
--space-3: 12px      /* 中小間距 */
--space-4: 16px      /* 中間距 */
--space-6: 24px      /* 中大間距 */
--space-8: 32px      /* 大間距 */
--space-12: 48px     /* 超大間距 */
--space-16: 64px     /* 特大間距 */
```

### Tailwind CSS 對應

```typescript
p-4    // padding: 16px
m-6    // margin: 24px
gap-4  // grid/flex gap: 16px
```

---

## 🎭 動畫系統

### Framer Motion 標準動畫

#### 1. 淡入上移（最常用）

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  內容
</motion.div>
```

#### 2. 淡入下移

```typescript
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  內容
</motion.div>
```

#### 3. 交錯列表動畫

```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

#### 4. 頁面轉場（帶方向）

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentPage}
    initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
    transition={{ duration: 0.3 }}
  >
    頁面內容
  </motion.div>
</AnimatePresence>
```

#### 5. 懸停效果

```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  按鈕
</motion.button>
```

---

## 🧩 組件庫

### shadcn/ui 組件

專案使用 **shadcn/ui** 組件庫（基於 Radix UI + Tailwind CSS）。

**組件位置：** `src/components/ui/`

### 常用組件

#### 按鈕（Button）

```typescript
import { Button } from "@/components/ui/button";

// 主要按鈕（鼠尾草綠）
<Button variant="default">主要操作</Button>

// 次要按鈕（白底綠邊）
<Button variant="outline">次要操作</Button>

// 透明按鈕
<Button variant="ghost">返回</Button>

// 危險操作（紅色）
<Button variant="destructive">刪除</Button>
```

#### 輸入框（Input）

```typescript
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div>
  <Label htmlFor="name">名稱</Label>
  <Input id="name" placeholder="請輸入名稱" />
</div>
```

#### 對話框（Dialog）

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>開啟對話框</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>標題</DialogTitle>
      <DialogDescription>描述文字</DialogDescription>
    </DialogHeader>
    <div>內容</div>
  </DialogContent>
</Dialog>
```

#### 卡片（Card）

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>標題</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>
    內容
  </CardContent>
</Card>
```

---

## 📐 佈局規範

### 頁面容器

```typescript
<div className="min-h-screen bg-[#FAFAF7] p-6">
  <div className="mx-auto max-w-4xl">
    {/* 頁面內容 */}
  </div>
</div>
```

### 內容卡片

```typescript
<div className="bg-white rounded-lg shadow-sm p-8">
  {/* 卡片內容 */}
</div>
```

### 響應式設計

```typescript
// 手機優先（Mobile First）
<div className="
  p-4           /* 手機：16px */
  md:p-6        /* 平板：24px */
  lg:p-8        /* 桌面：32px */
">
```

### 斷點（Breakpoints）

```css
sm: 640px      /* 手機橫向 */
md: 768px      /* 平板 */
lg: 1024px     /* 桌面 */
xl: 1280px     /* 大桌面 */
2xl: 1536px    /* 超大桌面 */
```

---

## 🎪 裝飾元素

### 自然主題裝飾

專案包含自訂的自然風格裝飾元件：

```typescript
import { NatureDecoration } from "@/components/NatureDecoration";
import { FloatingHerbs } from "@/components/FloatingHerbs";
import { NaturalPattern } from "@/components/NaturalPattern";

// 裝飾性植物元素
<NatureDecoration position="top-left" />

// 浮動動畫元素
<FloatingHerbs />

// 背景圖案
<NaturalPattern opacity={0.05} />
```

---

## ✅ 設計檢查清單

建立新介面時，請確認：

- [ ] 使用正確的品牌色彩（鼠尾草綠 #A8CBB7）
- [ ] 背景使用 #FAFAF7（灰白色）
- [ ] 文字使用 #2d3436（深灰）
- [ ] 使用 shadcn/ui 組件（不要重新造輪子）
- [ ] 加入 Framer Motion 動畫（淡入上移）
- [ ] 響應式設計（手機、平板、桌面）
- [ ] 間距一致（使用 Tailwind 標準間距）
- [ ] 圓角一致（rounded-lg = 8px）
- [ ] 陰影統一（shadow-sm 或 shadow-md）

---

## 🔍 範例：完整頁面結構

```typescript
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

export function ExamplePage() {
  return (
    <>
      <SEO title="範例頁面 | 醫療靈媒隨堂測驗" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-[#FAFAF7] p-6"
      >
        <div className="mx-auto max-w-4xl">
          {/* 返回按鈕 */}
          <Button variant="ghost" className="mb-6">
            ← 返回
          </Button>

          {/* 頁面標題 */}
          <h1 className="text-3xl font-bold text-[#2d3436] mb-6">
            頁面標題
          </h1>

          {/* 主要內容 */}
          <Card>
            <CardHeader>
              <CardTitle>卡片標題</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#636e72]">內容文字</p>

              {/* 操作按鈕 */}
              <div className="mt-6 flex gap-4">
                <Button variant="default">
                  主要操作
                </Button>
                <Button variant="outline">
                  次要操作
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
}
```

---

## 📚 相關檔案

- **組件庫：** `src/components/ui/`
- **自然裝飾：** `src/components/NatureDecoration.tsx`
- **設計參考：** Figma 設計稿（https://www.figma.com/design/a3i2fvV92IFl19Lom9aKXH/）

---

**記住：一致的設計 = 專業的產品！**
