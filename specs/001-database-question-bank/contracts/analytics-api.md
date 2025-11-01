# Analytics API Contract

**Base Path**: `/api/analytics`

**Purpose**: 統計分析功能，包含題目正確率和使用者得分分布

---

## Endpoints

### 1. GET /api/analytics/questions/:id

**功能**: 查詢單一題目的統計資料（正確率、作答次數）

**權限**: 公開（管理員）

#### Request

**Path Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 題目 ID（MongoDB ObjectId） |

**範例**:
```http
GET /api/analytics/questions/507f1f77bcf86cd799439011
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "questionId": "507f1f77bcf86cd799439011",
    "totalAttempts": 150,
    "correctCount": 120,
    "incorrectCount": 30,
    "correctRate": 0.80,
    "question": {
      "_id": "507f1f77bcf86cd799439011",
      "type": "single",
      "question": "芹菜汁對肝臟的主要功效是？",
      "difficulty": "中等",
      "book": "醫療靈媒"
    }
  }
}
```

**欄位說明**:

| 欄位 | 型別 | 說明 |
|------|------|------|
| `questionId` | string | 題目 ID |
| `totalAttempts` | number | 總作答次數 |
| `correctCount` | number | 答對次數 |
| `incorrectCount` | number | 答錯次數 |
| `correctRate` | number | 正確率（0-1，小數點後 2 位） |
| `question` | object | 題目基本資訊（可選） |

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": "Question not found"
}
```

**Error (404 Not Found - 無作答記錄)**:

```json
{
  "success": true,
  "data": {
    "questionId": "507f1f77bcf86cd799439011",
    "totalAttempts": 0,
    "correctCount": 0,
    "incorrectCount": 0,
    "correctRate": null,
    "question": {
      "_id": "507f1f77bcf86cd799439011",
      "type": "single",
      "question": "芹菜汁對肝臟的主要功效是？",
      "difficulty": "中等",
      "book": "醫療靈媒"
    }
  }
}
```

---

### 2. GET /api/analytics/questions

**功能**: 批次查詢多題目的統計資料（用於題庫管理頁面）

**權限**: 公開（管理員）

#### Request

**Query Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `ids` | string | ✅ | 題目 ID 列表（逗號分隔） |

**範例**:
```http
GET /api/analytics/questions?ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012,507f1f77bcf86cd799439013
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "questionId": "507f1f77bcf86cd799439011",
      "totalAttempts": 150,
      "correctRate": 0.80
    },
    {
      "questionId": "507f1f77bcf86cd799439012",
      "totalAttempts": 145,
      "correctRate": 0.65
    },
    {
      "questionId": "507f1f77bcf86cd799439013",
      "totalAttempts": 0,
      "correctRate": null
    }
  ]
}
```

---

### 3. GET /api/analytics/score-distribution

**功能**: 查詢使用者得分分布統計

**權限**: 公開（管理員）

#### Request

**Query Parameters**:

| 參數 | 型別 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `book` | string | ❌ | 書籍篩選 | `醫療靈媒` |
| `difficulty` | string | ❌ | 難度篩選 | `簡單`, `中等`, `困難` |
| `binSize` | number | ❌ | 分組區間大小 | `10`（預設 10，即 0-9, 10-19, ...） |

**範例**:
```http
GET /api/analytics/score-distribution?book=醫療靈媒&difficulty=中等&binSize=10
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "totalQuizzes": 500,
    "averageScore": 72.5,
    "medianScore": 75,
    "distribution": [
      {
        "range": "0-9",
        "count": 5,
        "percentage": 1.0
      },
      {
        "range": "10-19",
        "count": 10,
        "percentage": 2.0
      },
      {
        "range": "20-29",
        "count": 15,
        "percentage": 3.0
      },
      {
        "range": "30-39",
        "count": 25,
        "percentage": 5.0
      },
      {
        "range": "40-49",
        "count": 40,
        "percentage": 8.0
      },
      {
        "range": "50-59",
        "count": 60,
        "percentage": 12.0
      },
      {
        "range": "60-69",
        "count": 80,
        "percentage": 16.0
      },
      {
        "range": "70-79",
        "count": 100,
        "percentage": 20.0
      },
      {
        "range": "80-89",
        "count": 90,
        "percentage": 18.0
      },
      {
        "range": "90-99",
        "count": 65,
        "percentage": 13.0
      },
      {
        "range": "100",
        "count": 10,
        "percentage": 2.0
      }
    ],
    "filters": {
      "book": "醫療靈媒",
      "difficulty": "中等"
    }
  }
}
```

**欄位說明**:

| 欄位 | 型別 | 說明 |
|------|------|------|
| `totalQuizzes` | number | 符合條件的總測驗次數 |
| `averageScore` | number | 平均分數（小數點後 1 位） |
| `medianScore` | number | 中位數分數 |
| `distribution` | array | 分數分布陣列 |
| `distribution[].range` | string | 分數區間（如 `0-9`, `100`） |
| `distribution[].count` | number | 該區間的測驗數量 |
| `distribution[].percentage` | number | 該區間的百分比（小數點後 1 位） |
| `filters` | object | 套用的篩選條件 |

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Invalid binSize. Must be between 1 and 100"
}
```

---

### 4. GET /api/analytics/summary

**功能**: 查詢整體統計摘要（用於儀表板首頁）

**權限**: 公開（管理員）

#### Request

**Query Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `book` | string | ❌ | 書籍篩選 |
| `difficulty` | string | ❌ | 難度篩選 |

**範例**:
```http
GET /api/analytics/summary?book=醫療靈媒
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "totalQuestions": 1000,
    "totalQuizzes": 500,
    "totalAttempts": 10000,
    "averageScore": 72.5,
    "questionsByDifficulty": {
      "簡單": 350,
      "中等": 450,
      "困難": 200
    },
    "questionsByType": {
      "single": 500,
      "multiple": 300,
      "fill": 200
    },
    "quizzesByDifficulty": {
      "簡單": 200,
      "中等": 200,
      "困難": 100
    },
    "topDifficultQuestions": [
      {
        "questionId": "507f1f77bcf86cd799439011",
        "question": "以下哪些是重金屬排毒五大天王？",
        "correctRate": 0.35,
        "totalAttempts": 150
      },
      {
        "questionId": "507f1f77bcf86cd799439012",
        "question": "369 排毒法的完整流程為何？",
        "correctRate": 0.40,
        "totalAttempts": 140
      }
    ],
    "topEasyQuestions": [
      {
        "questionId": "507f1f77bcf86cd799439099",
        "question": "芹菜汁應該在什麼時候喝？",
        "correctRate": 0.95,
        "totalAttempts": 160
      }
    ]
  }
}
```

**欄位說明**:

| 欄位 | 型別 | 說明 |
|------|------|------|
| `totalQuestions` | number | 題庫總題數 |
| `totalQuizzes` | number | 總測驗次數 |
| `totalAttempts` | number | 總作答次數（quizzes × 20） |
| `averageScore` | number | 平均分數 |
| `questionsByDifficulty` | object | 各難度的題目數量 |
| `questionsByType` | object | 各題型的題目數量 |
| `quizzesByDifficulty` | object | 各難度的測驗次數 |
| `topDifficultQuestions` | array | 最難的 5 題（正確率最低） |
| `topEasyQuestions` | array | 最簡單的 5 題（正確率最高） |

---

## Business Rules

### 統計計算規則（FR-021, FR-023）

1. **即時計算**：所有統計資料在查詢時即時計算，不預先儲存
2. **計算範圍**：僅計算已提交的測驗（`totalScore > 0`）
3. **正確率計算**：
   ```
   correctRate = correctCount / (correctCount + incorrectCount)
   ```
4. **無作答記錄**：`correctRate = null`，`totalAttempts = 0`

### 題目正確率查詢（SC-005）

**MongoDB Aggregation Pipeline**:

```typescript
// server/src/controllers/analyticsController.ts

async function getQuestionStats(questionId: string) {
  const stats = await Answer.aggregate([
    { $match: { questionId: new mongoose.Types.ObjectId(questionId) } },
    {
      $group: {
        _id: '$isCorrect',
        count: { $sum: 1 }
      }
    }
  ]);

  const correctCount = stats.find(s => s._id === true)?.count || 0;
  const incorrectCount = stats.find(s => s._id === false)?.count || 0;
  const totalAttempts = correctCount + incorrectCount;

  return {
    questionId,
    totalAttempts,
    correctCount,
    incorrectCount,
    correctRate: totalAttempts > 0 ? correctCount / totalAttempts : null
  };
}
```

**效能優化**:
- 使用索引 `{ questionId: 1, isCorrect: 1 }`
- 查詢時間 < 3 秒（SC-005）

### 得分分布查詢（SC-007）

**MongoDB Aggregation Pipeline**:

```typescript
async function getScoreDistribution(
  book?: string,
  difficulty?: string,
  binSize: number = 10
) {
  const matchStage: any = { totalScore: { $gt: 0 } };
  if (book) matchStage.book = book;
  if (difficulty) matchStage.difficulty = difficulty;

  const distribution = await Quiz.aggregate([
    { $match: matchStage },
    {
      $bucket: {
        groupBy: '$totalScore',
        boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 101],
        default: 'other',
        output: {
          count: { $sum: 1 }
        }
      }
    }
  ]);

  // 計算統計值
  const stats = await Quiz.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        averageScore: { $avg: '$totalScore' }
      }
    }
  ]);

  // 計算中位數
  const sortedScores = await Quiz.find(matchStage)
    .select('totalScore')
    .sort('totalScore')
    .lean();

  const medianScore = sortedScores[Math.floor(sortedScores.length / 2)]?.totalScore || 0;

  return {
    totalQuizzes: stats[0]?.totalQuizzes || 0,
    averageScore: parseFloat(stats[0]?.averageScore?.toFixed(1)) || 0,
    medianScore,
    distribution: distribution.map(d => ({
      range: `${d._id}-${d._id + binSize - 1}`,
      count: d.count,
      percentage: parseFloat(((d.count / stats[0]?.totalQuizzes) * 100).toFixed(1))
    }))
  };
}
```

**效能優化**:
- 使用索引 `{ book: 1, difficulty: 1, totalScore: 1 }`
- 查詢時間 < 3 秒（SC-007）

---

## Error Codes

| HTTP Status | Error Code | 說明 |
|-------------|------------|------|
| 400 | VALIDATION_ERROR | 請求參數驗證失敗 |
| 404 | NOT_FOUND | 題目不存在 |
| 500 | INTERNAL_ERROR | 伺服器內部錯誤 |

---

## Rate Limiting

- **一般查詢**: 100 requests/分鐘

---

## Examples

### 範例 1：顯示題目正確率（前端）

```typescript
// src/services/analyticsService.ts

import axios from 'axios';

export async function getQuestionStats(questionId: string) {
  const response = await axios.get(`/api/analytics/questions/${questionId}`);
  return response.data.data;
}

// 在題庫管理頁面使用
function QuestionListItem({ question }: { question: Question }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getQuestionStats(question._id).then(setStats);
  }, [question._id]);

  return (
    <div>
      <p>{question.question}</p>
      {stats && (
        <p>
          正確率: {(stats.correctRate * 100).toFixed(1)}%
          （{stats.correctCount}/{stats.totalAttempts}）
        </p>
      )}
    </div>
  );
}
```

### 範例 2：顯示得分分布圖表

```typescript
export async function getScoreDistribution(
  book?: string,
  difficulty?: string
) {
  const response = await axios.get('/api/analytics/score-distribution', {
    params: { book, difficulty, binSize: 10 }
  });
  return response.data.data;
}

// 在分析頁面使用
function ScoreDistributionChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getScoreDistribution('醫療靈媒', '中等').then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>得分分布（平均: {data.averageScore} 分）</h2>
      <BarChart data={data.distribution} />
    </div>
  );
}
```

### 範例 3：儀表板摘要

```typescript
export async function getAnalyticsSummary(book?: string) {
  const response = await axios.get('/api/analytics/summary', {
    params: { book }
  });
  return response.data.data;
}

function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getAnalyticsSummary('醫療靈媒').then(setSummary);
  }, []);

  return (
    <div>
      <h1>統計摘要</h1>
      <p>總題數: {summary.totalQuestions}</p>
      <p>總測驗次數: {summary.totalQuizzes}</p>
      <p>平均分數: {summary.averageScore}</p>

      <h2>最難的 5 題</h2>
      <ul>
        {summary.topDifficultQuestions.map(q => (
          <li key={q.questionId}>
            {q.question} - 正確率 {(q.correctRate * 100).toFixed(1)}%
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Performance Considerations

### 查詢優化策略

1. **索引使用**:
   - `Answer.questionId` + `Answer.isCorrect`：題目正確率查詢
   - `Quiz.book` + `Quiz.difficulty` + `Quiz.totalScore`：得分分布查詢

2. **Aggregation Pipeline 優化**:
   - 使用 `$match` 先篩選，減少資料量
   - 使用 `$bucket` 進行分組統計
   - 使用 `$group` 計算聚合值

3. **快取策略（未來可選）**:
   - 統計資料變化不頻繁，可考慮 Redis 快取 5 分鐘
   - 快取 key 格式：`analytics:question:{questionId}`
   - 快取失效：題目被刪除或新增作答記錄

4. **分頁處理**:
   - 批次查詢題目統計時，一次最多查詢 100 題
   - 使用 `Promise.all` 並行查詢多個統計

### 效能目標

- 單一題目統計：< 1 秒
- 得分分布查詢：< 3 秒（SC-007）
- 儀表板摘要：< 5 秒
- 並發支援：10 個並發請求（SC-010）
