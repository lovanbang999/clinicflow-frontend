import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Simple generic data-fetching hook with loading state and refetch.
 * Replaces the ad-hoc pattern of useState + useEffect + try/catch.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref for the fetcher so changing lambdas don't cause infinite loops
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
