import { useState, useCallback } from 'react';
import { api, setToken, clearToken } from '@/lib/api';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    // Add 60s buffer to avoid edge cases
    return Date.now() >= (payload.exp - 60) * 1000;
  } catch {
    return true;
  }
}

function getValidToken(): string | null {
  const token = localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    return null;
  }
  return token;
}

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(getValidToken);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    setToken(res.token);
    setTokenState(res.token);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  return { token, login, logout };
}
