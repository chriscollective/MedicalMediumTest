import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'mmquiz_user_id';

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('Generated new user ID:', userId);
  }

  return userId;
}

export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}
