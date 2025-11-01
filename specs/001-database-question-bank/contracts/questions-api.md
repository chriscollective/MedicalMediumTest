# Questions API Contract

**Base Path**: `/api/questions`

**Purpose**: 題目資料的 CRUD 操作（管理員功能）和測驗題目抽取

---

## Endpoints

### 1. GET /api/questions

**功能**: 查詢題目列表（支援篩選）

**權限**: 公開（測驗使用）/ 管理員（後台管理）

#### Request

**Query Parameters**:

| 參數 | 型別 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `book` | string | ❌ | 書籍篩選 | `醫療靈媒` |
| `difficulty` | string | ❌ | 難度篩選 | `簡單`, `中等`, `困難` |
| `type` | string | ❌ | 題型篩選 | `single`, `multiple`, `fill` |
| `limit` | number | ❌ | 回傳數量限制 | `10`（預設 20） |
| `random` | boolean | ❌ | 是否隨機排序 | `true`（預設 false） |

**範例**:
```http
GET /api/questions?book=醫療靈媒&difficulty=中等&type=single&limit=10&random=true
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "single",
      "question": "芹菜汁對肝臟的主要功效是？",
      "options": ["排毒", "補充能量", "增強記憶", "提升視力"],
      "correctAnswer": "排毒",
      "source": "醫療靈媒-改變生命的食物 p.123",
      "explanation": "芹菜汁含有鈉簇鹽，能深層清潔肝臟...",
      "difficulty": "中等",
      "book": "醫療靈媒",
      "createdAt": "2025-10-30T10:00:00.000Z",
      "updatedAt": "2025-10-30T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Invalid difficulty value. Must be one of: 簡單, 中等, 困難"
}
```

**Error (500 Internal Server Error)**:

```json
{
  "success": false,
  "error": "Database query failed"
}
```

---

### 2. GET /api/questions/:id

**功能**: 取得單一題目詳細資料

**權限**: 公開

#### Request

**Path Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 題目 MongoDB ObjectId |

**範例**:
```http
GET /api/questions/507f1f77bcf86cd799439011
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "single",
    "question": "芹菜汁對肝臟的主要功效是？",
    "options": ["排毒", "補充能量", "增強記憶", "提升視力"],
    "correctAnswer": "排毒",
    "source": "醫療靈媒-改變生命的食物 p.123",
    "explanation": "芹菜汁含有鈉簇鹽，能深層清潔肝臟...",
    "difficulty": "中等",
    "book": "醫療靈媒",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  }
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": "Question not found"
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Invalid question ID format"
}
```

---

### 3. POST /api/questions

**功能**: 新增題目（管理員功能）

**權限**: 🔒 管理員

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body** (單選題範例):

```json
{
  "type": "single",
  "question": "芹菜汁對肝臟的主要功效是？",
  "options": ["排毒", "補充能量", "增強記憶", "提升視力"],
  "correctAnswer": "排毒",
  "source": "醫療靈媒-改變生命的食物 p.123",
  "explanation": "芹菜汁含有鈉簇鹽，能深層清潔肝臟...",
  "difficulty": "中等",
  "book": "醫療靈媒"
}
```

**Body** (多選題範例):

```json
{
  "type": "multiple",
  "question": "以下哪些是重金屬排毒五大天王？",
  "options": ["螺旋藻", "大麥草汁粉", "香菜", "野生藍莓", "大西洋紅藻", "薑黃"],
  "correctAnswer": ["螺旋藻", "大麥草汁粉", "香菜", "野生藍莓", "大西洋紅藻"],
  "difficulty": "困難",
  "book": "醫療靈媒"
}
```

**Body** (填空題範例):

```json
{
  "type": "fill",
  "question": "369 排毒法的「9」代表連續____天只喝芹菜汁和果汁。",
  "fillOptions": ["1", "3", "5", "7", "9", "14", "21", "28"],
  "correctAnswer": "9",
  "difficulty": "簡單",
  "book": "醫療靈媒"
}
```

#### Response

**Success (201 Created)**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "single",
    "question": "芹菜汁對肝臟的主要功效是？",
    "options": ["排毒", "補充能量", "增強記憶", "提升視力"],
    "correctAnswer": "排毒",
    "source": "醫療靈媒-改變生命的食物 p.123",
    "explanation": "芹菜汁含有鈉簇鹽，能深層清潔肝臟...",
    "difficulty": "中等",
    "book": "醫療靈媒",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  },
  "message": "Question created successfully"
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Validation failed: options is required for single choice questions"
}
```

**Error (401 Unauthorized)**:

```json
{
  "success": false,
  "error": "Admin authentication required"
}
```

---

### 4. PUT /api/questions/:id

**功能**: 更新題目（管理員功能）

**權限**: 🔒 管理員

#### Request

**Path Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 題目 MongoDB ObjectId |

**Headers**:
```
Content-Type: application/json
```

**Body** (部分更新範例):

```json
{
  "explanation": "更新的解析內容...",
  "difficulty": "困難"
}
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "single",
    "question": "芹菜汁對肝臟的主要功效是？",
    "options": ["排毒", "補充能量", "增強記憶", "提升視力"],
    "correctAnswer": "排毒",
    "source": "醫療靈媒-改變生命的食物 p.123",
    "explanation": "更新的解析內容...",
    "difficulty": "困難",
    "book": "醫療靈媒",
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  },
  "message": "Question updated successfully"
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": "Question not found"
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Validation failed: difficulty must be one of [簡單, 中等, 困難]"
}
```

---

### 5. DELETE /api/questions/:id

**功能**: 刪除題目（管理員功能）

**權限**: 🔒 管理員

#### Request

**Path Parameters**:

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | ✅ | 題目 MongoDB ObjectId |

**範例**:
```http
DELETE /api/questions/507f1f77bcf86cd799439011
```

#### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": "Question not found"
}
```

**Error (401 Unauthorized)**:

```json
{
  "success": false,
  "error": "Admin authentication required"
}
```

---

## Business Rules

### 題目抽取規則（FR-012）

當使用者開始測驗時，前端呼叫：

```http
GET /api/questions?book=醫療靈媒&difficulty=中等&type=single&limit=10&random=true
GET /api/questions?book=醫療靈媒&difficulty=中等&type=multiple&limit=5&random=true
GET /api/questions?book=醫療靈媒&difficulty=中等&type=fill&limit=5&random=true
```

後端實作隨機抽取：

```typescript
// Mongoose aggregation pipeline
Question.aggregate([
  { $match: { book, difficulty, type } },
  { $sample: { size: limit } }  // 隨機抽取
]);
```

### 驗證規則

1. **type 驗證**:
   - 必須為 `single`, `multiple`, `fill` 之一

2. **options 驗證**:
   - 單選/多選題：必須提供 2-10 個選項
   - 填空題：不應有 `options` 欄位

3. **fillOptions 驗證**:
   - 填空題：必須提供 3-20 個答案選項
   - 單選/多選題：不應有 `fillOptions` 欄位

4. **correctAnswer 驗證**:
   - 單選/填空：必須是 `string`
   - 多選：必須是 `string[]`，且至少有 1 個元素

5. **difficulty 驗證**:
   - 必須為 `簡單`, `中等`, `困難` 之一

---

## Error Codes

| HTTP Status | Error Code | 說明 |
|-------------|------------|------|
| 400 | VALIDATION_ERROR | 請求資料驗證失敗 |
| 401 | UNAUTHORIZED | 未授權（需要管理員登入） |
| 404 | NOT_FOUND | 題目不存在 |
| 500 | INTERNAL_ERROR | 伺服器內部錯誤 |

---

## Rate Limiting

- **一般查詢**: 100 requests/分鐘
- **CRUD 操作**: 30 requests/分鐘（管理員）

---

## Examples

### 範例 1：開始測驗（前端呼叫）

```typescript
// src/services/questionService.ts

import axios from 'axios';

export async function fetchQuizQuestions(
  book: string,
  difficulty: string
): Promise<Question[]> {
  const [singles, multiples, fills] = await Promise.all([
    axios.get('/api/questions', {
      params: { book, difficulty, type: 'single', limit: 10, random: true }
    }),
    axios.get('/api/questions', {
      params: { book, difficulty, type: 'multiple', limit: 5, random: true }
    }),
    axios.get('/api/questions', {
      params: { book, difficulty, type: 'fill', limit: 5, random: true }
    })
  ]);

  return [
    ...singles.data.data,
    ...multiples.data.data,
    ...fills.data.data
  ];
}
```

### 範例 2：管理員新增題目

```typescript
// src/services/questionService.ts

export async function createQuestion(questionData: Partial<Question>) {
  const response = await axios.post('/api/questions', questionData);
  return response.data.data;
}
```

### 範例 3：管理員刪除題目

```typescript
export async function deleteQuestion(questionId: string) {
  await axios.delete(`/api/questions/${questionId}`);
}
```
