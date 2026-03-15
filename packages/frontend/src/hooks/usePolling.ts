import { useEffect, useRef, useState, useCallback } from 'react';

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 5000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch();
  }, [fetch]);

  useEffect(() => {
    fetch();
    intervalRef.current = setInterval(fetch, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch, intervalMs]);

  return { data, loading, error, refresh };
}
