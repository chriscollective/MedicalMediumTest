export function fillAwareIsAnswerCorrect(
  questionType: 'single' | 'multiple' | 'fill',
  userAnswer: number | number[] | null,
  correctAnswer: number | number[]
): boolean {
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }

  if (questionType === 'single') {
    // 單選：索引需相等
    return typeof userAnswer === 'number' && typeof correctAnswer === 'number'
      ? userAnswer === correctAnswer
      : false;
  }

  if (questionType === 'multiple') {
    // 多選：順序不影響，比較集合是否完全相同
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }
    const sortedUser = [...userAnswer].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswer].sort((a, b) => a - b);
    if (sortedUser.length !== sortedCorrect.length) return false;
    return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
  }

  if (questionType === 'fill') {
    // 填空：需完全符合「有序多答案」規則
    // 相容舊資料情境：
    // - correct 可為 number 或 number[]
    // - user 可為 number 或 number[]（前端舊版可能傳單一索引）

    // 皆為單一索引
    if (typeof correctAnswer === 'number' && typeof userAnswer === 'number') {
      return userAnswer === correctAnswer;
    }

    // 正解為陣列（有序），使用者也提供陣列：需長度與順序完全一致
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      if (userAnswer.length !== correctAnswer.length) return false;
      for (let i = 0; i < correctAnswer.length; i++) {
        if (userAnswer[i] !== correctAnswer[i]) return false;
      }
      return true;
    }

    // 相容情況：正解為單一索引，但使用者傳陣列（需唯一且長度為 1 且相同）
    if (typeof correctAnswer === 'number' && Array.isArray(userAnswer)) {
      return userAnswer.length === 1 && userAnswer[0] === correctAnswer;
    }

    // 相容情況：正解為多索引，但使用者傳單一索引
    // 若正解只有 1 個元素，且相同則判對；否則（多於 1 個）不算正確
    if (Array.isArray(correctAnswer) && typeof userAnswer === 'number') {
      return correctAnswer.length === 1 && correctAnswer[0] === userAnswer;
    }

    return false;
  }

  return false;
}

// 正規化 correctAnswer：
// - single: 轉為數字
// - multiple: 轉為數字陣列，去除 NaN 與重複（保留首次出現順序）
// - fill: 若為陣列，保留順序、去除 NaN 與重複；若為單值，轉為數字
export function normalizeCorrectAnswer(
  questionType: 'single' | 'multiple' | 'fill',
  value: any
): number | number[] {
  const toInt = (x: any) => (typeof x === 'number' ? x : parseInt(String(x), 10));

  if (questionType === 'single') {
    const n = toInt(value);
    return Number.isFinite(n) ? n : 0;
  }

  if (questionType === 'multiple') {
    const arr = Array.isArray(value) ? value : [value];
    const seen = new Set<number>();
    const out: number[] = [];
    for (const v of arr) {
      const n = toInt(v);
      if (Number.isFinite(n) && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
    return out;
  }

  // fill（有序且不重複）
  if (Array.isArray(value)) {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const v of value) {
      const n = toInt(v);
      if (Number.isFinite(n) && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
    return out;
  }
  const n = toInt(value);
  return Number.isFinite(n) ? n : 0;
}
