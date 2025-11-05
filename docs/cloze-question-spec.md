# 克漏字題型需求規格

## 功能概述

- 題目內容仍維持既有欄位（`question` 字串搭配插入空格提示，例如 `___`）。
- 1~6 個選項存放在現有 `options` 陣列中（每個皆為非空字串）。
- `correctAnswer` 以陣列儲存正確順序（索引需唯一且介於 0 ~ `options.length - 1`）；只有選項與順序全對才算答對。
- 其他欄位（`fillOptions`、`source`、`book`…）維持原格式。

## 資料模型調整摘要

- Schema `type` 加入 `'cloze'`。
- `options` 驗證加上當 `type === 'cloze'` 時需 1~6 個非空選項。
- `correctAnswer` 驗證新增 cloze 規則（長度需與 `options` 相同、索引合法且無重複）。
- 前端 `QuestionType` 加入 `cloze`，其餘欄位沿用既有結構。

## 後續實作提示

- 作答判斷：後端 `submitQuiz` 及前端備援計分都需改為比較索引陣列順序。
- 題庫管理：新增/編輯表單需提供 1~6 個選項輸入與順序設定 UI。
- 前端作答：設計拖放或排序輸入，送回 `correctAnswer` 相同格式的陣列。
