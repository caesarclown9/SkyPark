import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  dependencies?: unknown[];
  enabled?: boolean;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const { initialData = null, dependencies = [], enabled = true } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Используем ref для стабильного хранения функции
  const asyncFunctionRef = useRef(asyncFunction);
  asyncFunctionRef.current = asyncFunction;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunctionRef.current();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(errorMessage);
      // Централизованное логирование
      if (process.env.NODE_ENV === 'development') {
        console.error('useAsyncData error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Сериализуем dependencies для стабильного сравнения
  const dependenciesString = JSON.stringify(dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData, dependenciesString]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
    setError,
  };
}

// Специализированный хук для пагинированных данных
interface UsePaginatedDataOptions<T> {
  initialPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface UsePaginatedDataReturn<T> {
  data: T[];
  pagination: PaginatedResponse<T>['pagination'] | null;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function usePaginatedData<T>(
  asyncFunction: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataReturn<T> {
  const { initialPage = 1, pageSize = 12, enabled = true } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<T>['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Используем ref для стабильного хранения функции
  const asyncFunctionRef = useRef(asyncFunction);
  asyncFunctionRef.current = asyncFunction;

  const fetchData = useCallback(async (page: number = currentPage, append: boolean = false) => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunctionRef.current(page, pageSize);
      
      if (append) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error('usePaginatedData error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, enabled]);

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData]);

  const loadMore = useCallback(async () => {
    if (pagination && currentPage < pagination.total_pages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchData(nextPage, true);
    }
  }, [pagination, currentPage, fetchData]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    loadMore,
    setPage,
    refetch: () => fetchData(currentPage),
  };
} 