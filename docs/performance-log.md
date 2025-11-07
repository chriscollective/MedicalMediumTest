# 效能紀錄

## 2025-11-05

- **數據分析（Analytics）**
  - 原本四支 API 並行請求：`耗時 ≈ 6082 ms`（首次記錄）
  - 合併 `/api/analytics/overview` 後：`耗時 ≈ 5485 ms`
  - 啟用 MongoDB 聚合 + 45 秒快取 + 新索引：`耗時 ≈ 480 ms`

- **排行榜（Leaderboard）**
  - `getAllLeaderboards` 合併請求：`耗時 ≈ 52 ms`

- **題庫（Question Bank）**
  - 全量題目 + 統計（含 `/analytics/questions/stats`）：`耗時 ≈ 301 ms`

- **測驗抽題（Quiz）**
  - 單一本書：`題數 20，耗時 ≈ 53 ms`
  - 兩本混合：`題數 20，耗時 ≈ 106 ms`
  - 三本混合（進階）：`題數 20，耗時 ≈ 145 ms`

> 註：時間來自瀏覽器 Console 日誌（同日時測試）；快取開啟時若在 TTL 內重複刷新，會顯示更低的耗時（如 23 ms）。若要比較未快取的情況，需在快取過期後或手動清除後再量測。***

## 2025-11-05（壓力測試）

- **Scenario**：Artillery `quiz-flow`（建立測驗 → 提交答案），資料來源為 `loadtest-questions.json`。
- **環境**：Render free tier（`https://medicalmediumtest.onrender.com`）+ MongoDB Atlas。

### 測試 A：高壓極限探索（arrivalRate 10→50→120 req/sec）
- `http.requests`：23,767；成功回應（2xx）僅 3,884。
- 失敗：`ETIMEDOUT 17,825`、`502 2,039`、捕捉失敗 1,892。
- 延遲：平均 3.8 s，p95 ≈ 9.4 s。
- 觀察：服務在 ~60 req/sec 以上即大量逾時；Render 代理回覆 502，MongoDB 寫入數量暴增（Quizzes 12595 筆）。
- 建議：高壓前先調整 phase、或升級服務等級後再試；壓測完需清理 `quizzes` 測試資料，可用 `server/src/scripts/clear-quizzes.ts`。

### 測試 B：逐步升壓（arrivalRate 5→10→15 req/sec）
- `http.requests`：3,598；成功回應 3,596（2 筆 502）。
- 延遲：平均 0.56 s，p95 ≈ 1.04 s，p99 ≈ 1.22 s。
- 成功率：99.9%（`vusers.failed 2`）；整體流程耗時約 2.1 s。
- 初步結論：在 ~15 req/sec（約 30 HTTP req/sec）下 Render + Atlas 表現穩定，可作為目前安全負載基準。
- 下一步：將最後一階段調高至 20、25 req/sec 重測，找出會開始出現逾時／5xx 的門檻，同時觀察 Render 日誌與 Atlas Metrics，以判斷 CPU、連線數或資料庫是否成為瓶頸。
