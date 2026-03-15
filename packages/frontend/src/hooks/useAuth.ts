import { useState, useCallback } from 'react';
import { api, setToken, clearToken } from '@/lib/api';

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem('token')
  );

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
