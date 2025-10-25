// app/data/tea-types.ts
import useSWR from 'swr';
import { API_URL } from '../constants/Api';
import fetcher from './_fetcher';

export type TeaType = {
  _id: string;
  name: string;
  description?: string;
};

// IMPORTANT: API_URL likely already includes '/api' → so use '/teaTypes' (not '/api/teaTypes')
export default function useTeaTypes() {
  const url = `${API_URL}/teaTypes`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  const items: TeaType[] = Array.isArray(data) ? data : data?.items ?? [];
  return { items, isLoading, error, mutate };
}
