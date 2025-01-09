'use server';

import { useSupabaseServerContext } from '@/context/Supabase/useSupabaseContext';
import { BASE_URL } from './buster/instances';

export interface FetchConfig extends RequestInit {
  baseURL?: string;
  params?: Record<string, string>;
}

export const serverFetch = async <T>(url: string, config: FetchConfig = {}): Promise<T> => {
  const { accessToken } = await useSupabaseServerContext();

  const { baseURL = BASE_URL, params, headers = {}, method = 'GET', ...restConfig } = config;

  // Construct URL with query parameters
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';

  const fullUrl = `${baseURL}${url}${queryParams}`;

  // Merge headers with authorization
  const finalHeaders = {
    ...headers,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` })
  };

  try {
    const response = await fetch(fullUrl, {
      method,
      ...restConfig,
      headers: finalHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
