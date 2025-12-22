// data/tea.ts
import { API_URL } from '@/constants/Api';
import useSWR from 'swr';
import fetcher from './_fetcher';

export function useTea(id?: string | string[]) {
  const teaId = Array.isArray(id) ? id[0] : id;

  const key = teaId ? `${API_URL}/teas/${teaId}` : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });

  return { tea: data, error, isLoading, mutate };
}
