import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: 'super' | 'admin';
  lastLogin?: Date;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

// Local storage keys
const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post('/admin/login', credentials);

  if (response.data.success) {
    const { token, admin } = response.data.data;

    // Save to localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(admin));

    // Set default Authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return { token, admin };
  }

  throw new Error(response.data.message || '登入失敗');
}

export async function verifyToken(): Promise<AdminUser | null> {
  try {
    const token = getToken();

    if (!token) {
      return null;
    }

    // Set Authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const response = await api.post('/admin/verify');

    if (response.data.success) {
      const admin = response.data.data.admin;
      localStorage.setItem(USER_KEY, JSON.stringify(admin));
      return admin;
    }

    // Token invalid, clear storage
    clearAuth();
    return null;
  } catch (error) {
    clearAuth();
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await api.post('/admin/logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AdminUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete api.defaults.headers.common['Authorization'];
}

// Set token on app initialization if exists
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
