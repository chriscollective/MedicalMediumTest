<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Changes: Initial constitution creation
Added principles:
  1. 簡單優先 (Simplicity First)
  2. 品質至上 (Quality Over Quantity)
  3. 單體架構 (Monolithic Architecture)
  4. 實用主義 (Pragmatism Over Perfection)
Added sections:
  - 技術約束 (Technical Constraints)
  - 開發規範 (Development Standards)
Templates requiring updates:
  ✅ plan-template.md - No updates needed (generic structure compatible)
  ✅ spec-template.md - No updates needed (user story focus compatible)
  ✅ tasks-template.md - No updates needed (task structure compatible)
Follow-up: None
-->

# 醫療靈媒測驗應用程式 Constitution

## Core Principles

### I. 簡單優先 (Simplicity First)

**MUST** 優先選擇最簡單的解決方案。避免過度設計和過度工程。

- 功能實作前必須問：「有更簡單的方法嗎？」
- 禁止引入非必要的抽象層、設計模式或架構複雜度
- 遵循 YAGNI 原則（You Aren't Gonna Need It）- 不實作目前不需要的功能
- 直接的程式碼優於「靈活」但複雜的程式碼

**理由**：簡單的程式碼更容易理解、維護和除錯。過早的優化和抽象化會增加認知負擔並降低開發速度。

### II. 品質至上 (Quality Over Quantity)

**MUST** 撰寫高品質、可讀性強的程式碼。

- 變數和函數命名必須清晰表達意圖
- 函數應該簡短且只做一件事
- 複雜邏輯必須有註解說明「為什麼」而非「做什麼」
- 重複使用前必須確認是否真的需要抽象化（Rule of Three）
- 程式碼審查時品質優先於速度

**理由**：高品質的程式碼降低技術債，提高長期開發效率，減少 bug 產生。

### III. 單體架構 (Monolithic Architecture)

**MUST NOT** 採用前後端分離架構。所有功能在單一應用程式中實作。

- 前端與後端邏輯整合在同一專案中
- 避免建立獨立的 API 層，除非有明確的外部整合需求
- 狀態管理使用 React 內建機制（useState、useContext）
- 資料流保持簡單直接，避免複雜的狀態管理庫

**理由**：本專案規模不需要微服務或前後端分離的複雜度。單體架構簡化開發、部署和除錯流程。

### IV. 實用主義 (Pragmatism Over Perfection)

**MUST** 優先考慮實際需求而非理想化的架構。

- 接受適度的權衡（trade-offs）以實現目標
- 技術選擇基於專案需求而非流行趨勢
- 重構時必須有明確的改善目標，避免為了重構而重構
- 快速迭代優於完美規劃

**理由**：完美是優秀的敵人。實用主義確保專案持續前進並交付價值。

### V. 漸進式改進 (Incremental Improvement)

**SHOULD** 採用小步快跑的開發方式。

- 功能以最小可用版本（MVP）為目標
- 每次提交應該是可運行的增量改進
- 優先實作核心功能，延後次要功能
- 基於實際使用反饋進行迭代

**理由**：漸進式開發降低風險，提供早期反饋機會，避免大規模返工。

## 技術約束 (Technical Constraints)

### 技術棧限制

本專案**必須**使用以下技術：

- **前端框架**：React 18+ with TypeScript
- **建構工具**：Vite
- **UI 組件**：Radix UI + Tailwind CSS（已配置）
- **動畫**：Framer Motion (`motion/react`)
- **狀態管理**：React hooks（useState, useContext）
- **路由**：手動頁面路由（currentPage state）

### 禁止事項

- ❌ 不得引入 Redux、MobX 等複雜狀態管理庫
- ❌ 不得採用前後端分離架構
- ❌ 不得引入 GraphQL、REST API 框架（除非明確需要外部整合）
- ❌ 不得使用 React Router 等路由庫（當前手動路由已足夠）
- ❌ 不得引入非必要的依賴套件

### 允許例外

若需要違反上述約束，**必須**：
1. 在 Complexity Tracking 中記錄理由
2. 說明為何簡單方案不可行
3. 獲得團隊共識

## 開發規範 (Development Standards)

### 程式碼風格

- 使用 TypeScript 嚴格模式
- 遵循既有的程式碼風格（參考現有檔案）
- 組件使用函數式組件 + hooks
- Props 介面定義清晰

### 檔案組織

遵循現有結構：
```
src/
├── pages/           # 頁面組件
├── components/      # 可重用組件
│   ├── ui/         # shadcn/ui 組件
│   └── ...         # 自訂組件
└── styles/         # 全域樣式
```

### 提交規範

- 提交訊息簡潔清晰，說明改變的內容
- 每次提交應該是完整且可運行的單位
- 頻繁提交小改動優於大型單一提交

### 文件要求

- 複雜邏輯必須有註解
- 組件的 Props 介面即為文件（TypeScript types）
- CLAUDE.md 記錄專案架構和重要決策
- README.md 保持最新的安裝和運行指南

## Governance

本憲章是專案開發的最高指導原則。所有程式碼審查、技術決策和重構計劃都必須符合這些原則。

### 修訂程序

憲章修訂**必須**：
1. 記錄修改理由和影響範圍
2. 更新版本號（遵循語意化版本）
3. 在 Sync Impact Report 中說明變更
4. 確保所有模板文件同步更新

### 合規性檢查

- 新功能實作前必須檢查是否符合憲章原則
- 程式碼審查時檢查是否遵守技術約束
- 複雜度增加時必須在 Complexity Tracking 中記錄並正當化

### 彈性處理

當原則與實際需求衝突時：
1. 優先評估是否可以調整需求以符合原則
2. 若確實需要例外，必須記錄並正當化
3. 定期回顧例外情況，評估是否需要調整憲章

**Version**: 1.0.0 | **Ratified**: 2025-10-30 | **Last Amended**: 2025-10-30
