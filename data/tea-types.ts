// data/tea-types.ts
import useSWR from 'swr';
import { API_URL } from '../constants/Api';
import fetcher from './_fetcher';

export type TeaType = { _id: string; name: string; description?: string };

// Tries both shapes: either array or { items: [...] }
export default function useTeaTypes() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_URL}/teatypes`,
    fetcher
  );
  const items: TeaType[] = Array.isArray(data) ? data : data?.items ?? [];
  return { items, isLoading, error, mutate };
}
