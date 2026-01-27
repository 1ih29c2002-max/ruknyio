'use client';

/**
 * 📦 Query Provider - React Query Configuration
 * 
 * Features:
 * - Request deduplication (automatic)
 * - Smart caching with stale-while-revalidate
 * - Exponential backoff retry
 * - Optimistic update utilities
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode, useCallback } from 'react';
import { toast } from '@/components/toast-provider';

interface QueryProviderProps {
  children: ReactNode;
}

// ⚡ Smart retry with exponential backoff
function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30000); // Max 30s
}

// ⚡ Should retry based on error type
function shouldRetry(failureCount: number, error: unknown): boolean {
  // Don't retry on auth errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return false;
    }
  }
  return failureCount < 2;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ⚡ Stale time: data is fresh for 2 minutes
            staleTime: 2 * 60 * 1000,
            
            // ⚡ Cache time: keep unused data for 30 minutes
            gcTime: 30 * 60 * 1000,
            
            // ⚡ Smart retry with backoff
            retry: shouldRetry,
            retryDelay,
            
            // ⚡ Refetch settings
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            refetchOnReconnect: true,
            
            // ⚡ Network mode: always fetch when online
            networkMode: 'offlineFirst',
            
            // ⚡ Structural sharing for better performance
            structuralSharing: true,
          },
          mutations: {
            // ⚡ Retry mutations once with delay
            retry: 1,
            retryDelay: 1000,
            
            // ⚡ Network mode
            networkMode: 'offlineFirst',
            
            // ⚡ Global error handler
            onError: (error) => {
              if (error instanceof Error) {
                // Don't show toast for auth errors (handled elsewhere)
                if (!error.message.includes('401')) {
                  toast.error(error.message || 'حدث خطأ غير متوقع');
                }
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ============ Optimistic Update Utilities ============

/**
 * 🚀 Create optimistic update handlers for mutations
 * 
 * Usage:
 * ```tsx
 * const mutation = useMutation({
 *   mutationFn: updateItem,
 *   ...createOptimisticUpdate(queryClient, ['items'], (old, newItem) => ({
 *     ...old,
 *     items: old.items.map(i => i.id === newItem.id ? newItem : i)
 *   }))
 * });
 * ```
 */
export function createOptimisticUpdate<TData, TVariables>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updateFn: (oldData: TData, variables: TVariables) => TData
) {
  return {
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<TData>(queryKey, (old) =>
          old ? updateFn(old, variables) : old
        );
      }

      return { previousData };
    },

    onError: (
      _error: unknown,
      _variables: TVariables,
      context: { previousData?: TData } | undefined
    ) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * 🚀 Hook for optimistic list updates (add/remove/update)
 */
export function useOptimisticList<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: unknown[]
) {
  const addItem = useCallback(
    (item: T) => {
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old ? [item, ...old] : [item]
      );
    },
    [queryClient, queryKey]
  );

  const removeItem = useCallback(
    (id: string) => {
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old ? old.filter((item) => item.id !== id) : old
      );
    },
    [queryClient, queryKey]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<T>) => {
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old
          ? old.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            )
          : old
      );
    },
    [queryClient, queryKey]
  );

  return { addItem, removeItem, updateItem };
}
