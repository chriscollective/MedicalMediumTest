# 開發蠢事紀錄 🤦

> 記錄那些讓人拍額頭的開發瞬間，避免重蹈覆轍

---

## 2025-11-07：Tailwind 的騙局 😤

### 事件經過

**症狀：**

- `w-6 h-6` 完全不生效
- `hover:bg-green-100` 看不到任何變化
- `from-[#F8E9C9] to-[#EBDDBF]` 漸變色消失
- GradeBadge 的 A 級顏色莫名其妙失效

**嘗試過的無效方案：**

1. ❌ 加到 safelist → 沒用
2. ❌ 用 switch 寫完整類名 → 還是沒用
3. ❌ 重啟開發伺服器 → 依然沒用
4. ❌ 清除快取 → 繼續沒用

**最終發現真相：**

原來本專案的 Tailwind 根本沒有正確啟用動態編譯！

```
現狀：
main.tsx → import "./index.css" (4152行的舊編譯檔)
                ↓
         不會重新編譯 ❌
                ↓
    新類別永遠不會生效！
```

**問題根源：**

- ❌ 缺少 `postcss.config.js`
- ❌ `index.css` 是舊的靜態編譯結果
- ❌ 沒有動態編譯流程
- ⚠️ Tailwind v4 配置但用 v3 的方式

### 最終解決方案

**放棄治療，改用 inline style！** 🎉

```tsx
// ❌ 永遠別再這樣寫了
<Eye className="w-6 h-6" />
<Button className="hover:bg-green-100" />

// ✅ 老老實實用 inline style
<Eye style={{ width: "24px", height: "24px" }} />

// ✅ 或是用 state 控制 hover
const [hovered, setHovered] = useState(false);
<Button
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    backgroundColor: hovered ? "#86efac" : "transparent",
    transition: "all 0.2s"
  }}
/>
```

### 教訓與原則

#### ✅ 可以使用 Tailwind 的場景

- 簡單、靜態的類別：`flex`, `gap-4`, `p-6`
- 已經存在於 `index.css` 中的類別
- 不涉及動態值的樣式

#### ❌ 絕對不要用 Tailwind 的場景

- 動態拼接：`bg-${color}-100`
- 任意值：`from-[#F8E9C9]`（在條件渲染中）
- 圖示大小：`w-6 h-6`（會被組件覆蓋）
- 複雜的 hover 效果
- 需要 JavaScript 控制的樣式

#### 🔥 黃金法則

**當你發現 Tailwind 類別不生效時：**

1. 不要懷疑自己的語法
2. 不要瘋狂加 `!important`
3. 不要加到 safelist（沒用的）
4. **直接改用 inline style！**

### 相關案例

#### 案例 1: GradeBadge 的 A 級顏色

```tsx
// ❌ 失效
className="bg-gradient-to-br from-[#F8E9C9] to-[#EBDDBF]"

// ✅ 有效
style={{
  backgroundImage: "linear-gradient(to bottom right, #F8E9C9, #EBDDBF)"
}}
```

#### 案例 2: 圖示按鈕 hover 效果

```tsx
// ❌ 完全看不到變化
<Button className="hover:bg-green-100 hover:scale-110">
  <CheckSquare className="w-6 h-6" />
</Button>

// ✅ 明顯有效
<Button
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    backgroundColor: hovered ? "#86efac" : "transparent",
    transform: hovered ? "scale(1.1)" : "scale(1)",
    transition: "all 0.2s"
  }}
>
  <CheckSquare style={{ width: "24px", height: "24px" }} />
</Button>
```

#### 案例 3: 圖示大小永遠不生效

```tsx
// ❌ 16px 永遠不會變
<Trash2 className="w-4 h-4" />
<CheckCircle2 className="w-6 h-6" />

// ✅ 想要多大就多大
<Trash2 style={{ width: "24px", height: "24px" }} />
<CheckSquare style={{ width: "24px", height: "24px" }} />
```

---

## 為什麼不修復 Tailwind？

**嘗試修復的風險：**

- 💥 整個排版可能跑掉
- 💥 現有樣式可能失效
- 💥 需要重新測試所有頁面
- 💥 可能引入新的 bug

**現狀的優點：**

- ✅ 網站正常運作
- ✅ 生產版本只有 11.65 KB (gzipped)
- ✅ 不會突然改變
- ✅ inline style 100% 可靠

**結論：不要動它！維持現況！**

---

## 速查表：何時用什麼

| 情境       | 使用工具             | 範例                                                  |
| ---------- | -------------------- | ----------------------------------------------------- |
| 簡單佈局   | Tailwind 類別        | `flex gap-4 p-6`                                      |
| 動態顏色   | Inline style         | `style={{ color: isActive ? "#16a34a" : "#6b7280" }}` |
| Hover 效果 | State + Inline style | `onMouseEnter/Leave + style`                          |
| 圖示大小   | Inline style         | `style={{ width: "24px", height: "24px" }}`           |
| 漸變背景   | Inline style         | `style={{ backgroundImage: "linear-gradient(...)" }}` |
| 複雜動畫   | Framer Motion        | `<motion.div animate={{ ... }} />`                    |

---

## 其他蠢事（待補充）

### 佔位區塊

_下次遇到蠢事記得寫在這裡..._

---

**最後提醒：當 Tailwind 不生效時，不是你的問題，是設定的問題。直接用 inline style，別浪費時間！** 🚀
