import { useState, useCallback } from 'react';

interface UseApiCallOptions {
  retries?: number;
  retryDelay?: number;
}

interface UseApiCallReturn<T, A extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: A) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T, A extends unknown[]>(
  apiFunction: (...args: A) => Promise<T>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<T, A> {
  const { retries = 0, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: A): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await apiFunction(...args);
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      }
    }
    
    const errorMessage = lastError?.message || 'Произошла ошибка';
    setError(errorMessage);
    setLoading(false);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('useApiCall error after retries:', lastError);
    }
    
    return null;
  }, [apiFunction, retries, retryDelay]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Специализированный хук для мутаций (POST, PUT, DELETE)
interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseMutationReturn<T, A extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (...args: A) => Promise<T | null>;
  reset: () => void;
}

export function useMutation<T, A extends unknown[]>(
  mutationFunction: (...args: A) => Promise<T>,
  options: UseMutationOptions<T> = {}
): UseMutationReturn<T, A> {
  const { onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (...args: A): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFunction(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(errorMessage);
      onError?.(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('useMutation error:', err);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutationFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
} 