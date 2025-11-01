// 書籍映射配置
export const BOOKS = [
  { display: '《搶救肝臟》', db: '搶救肝臟' },
  { display: '《神奇西芹汁》', db: '神奇西芹汁' },
  { display: '《改變生命的食物》', db: '改變生命的食物' }
] as const;

// 難度映射配置
export const DIFFICULTIES = [
  { display: '初階', db: '初階', key: 'beginner' },
  { display: '進階', db: '進階', key: 'advanced' }
] as const;

// 輔助函數
export function getBookByDisplay(displayName: string) {
  return BOOKS.find(b => b.display === displayName)?.db || BOOKS[0].db;
}

export function getBookByIndex(index: number) {
  return BOOKS[index]?.db || BOOKS[0].db;
}

export function getDifficultyByKey(key: string) {
  return DIFFICULTIES.find(d => d.key === key)?.db || DIFFICULTIES[0].db;
}
