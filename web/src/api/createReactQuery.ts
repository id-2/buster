'use client';

import { useSupabaseContext } from '@/context/Supabase/SupabaseContextProvider';
import {
  useQueryClient,
  useMutation,
  useQuery,
  UseQueryOptions,
  keepPreviousData,
  useInfiniteQuery
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { useBusterNotifications } from '@/context/BusterNotifications';
import { RustApiError } from './buster/errors';
import { useMemoizedFn } from 'ahooks';

export interface BaseCreateQueryProps {
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  enabled?: boolean;
  staleTime?: number;
  accessToken?: string;
}
interface CreateQueryProps<T> extends UseQueryOptions<T> {
  queryKey: (string | number | object)[];
  isUseSession?: boolean;
  useErrorNotification?: boolean;
}

export const useCreateReactQuery = <T>({
  queryKey,
  queryFn,
  isUseSession = true,
  enabled = true,
  initialData,
  refetchOnWindowFocus = false,
  refetchOnMount = true,
  useErrorNotification = true,
  ...rest
}: CreateQueryProps<T> & BaseCreateQueryProps) => {
  const { openErrorNotification } = useBusterNotifications();
  const accessToken = useSupabaseContext((state) => state.accessToken);
  const baseEnabled = isUseSession ? !!accessToken : true;

  const q = useQuery({
    queryKey: [...queryKey],
    queryFn,
    enabled: baseEnabled && !!enabled,
    initialData,
    retry: 1,
    refetchOnWindowFocus,
    refetchOnMount,
    ...rest
  });

  useEffect(() => {
    if (q.error && useErrorNotification) {
      const errorMessage = q.error as RustApiError;
      openErrorNotification({
        message: errorMessage.message
      });
    }
  }, [q.error, useErrorNotification]);

  return q as QueryReturnType<T>;
};

export const useResetReactQuery = () => {
  const queryClient = useQueryClient();

  const run = useMemoizedFn(() => {
    queryClient.clear();
  });

  return { run };
};

interface CreateMutationProps<T, V> {
  mutationFn: (data: T) => Promise<V>;
  onSuccess?: (data: V) => void;
  onError?: (error: Error) => void;
}

export const useCreateReactMutation = <T, V>({
  mutationFn,
  onSuccess,
  onError
}: CreateMutationProps<T, V>) => {
  return useMutation({ mutationFn, onSuccess, onError });
};

interface PaginatedQueryProps<T> extends CreateQueryProps<T> {
  page?: number;
  pageSize?: number;
  initialData?: T;
}

// Add a type helper to handle the return type
type QueryReturnType<T> = Omit<ReturnType<typeof useQuery>, 'data'> & {
  data: T;
};

export const useCreateReactQueryPaginated = <T>({
  queryKey,
  queryFn,
  isUseSession = true,
  enabled = true,
  initialData,
  refetchOnWindowFocus = false,
  refetchOnMount = true,
  page = 0,
  pageSize = 25,
  ...rest
}: PaginatedQueryProps<T> & BaseCreateQueryProps): QueryReturnType<T> => {
  const accessToken = useSupabaseContext((state) => state.accessToken);
  const baseEnabled = isUseSession ? !!accessToken : true;

  return useQuery({
    queryKey: [...queryKey, { page, pageSize }],
    queryFn,
    enabled: baseEnabled && !!enabled,
    initialData,
    retry: 1,
    refetchOnWindowFocus,
    refetchOnMount,
    placeholderData: keepPreviousData,
    ...rest
  }) as QueryReturnType<T>;
};

type InfiniteQueryReturnType<T> = Omit<ReturnType<typeof useInfiniteQuery>, 'data'> & {
  data: T;
};

export const useCreateReactInfiniteQuery = <T>({
  queryKey,
  queryFn,
  enabled = true,
  initialPageParam = 0,
  getNextPageParam,
  ...rest
}: Parameters<typeof useInfiniteQuery>[0] & BaseCreateQueryProps) => {
  const accessToken = useSupabaseContext((state) => state.accessToken);
  const baseEnabled = !!accessToken;

  return useInfiniteQuery({
    ...rest,
    queryKey: [...queryKey],
    getNextPageParam,
    initialPageParam,
    enabled: baseEnabled && !!enabled
  }) as InfiniteQueryReturnType<T>;
};
