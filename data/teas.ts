// data/teas.ts
import { API_URL } from '@/constants/Api';
import useSWR from 'swr';

// Shared SWR key so other screens (Post) can update the Home cache reliably
export const TEAS_KEY = `${API_URL}/teas`;

const rawFetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText} :: ${body}`);
  }

  return res.json();
};

const teasFetcher = async (url: string) => {
  const data = await rawFetcher(url);
  return Array.isArray(data) ? data : data?.items ?? [];
};

export function useTeas() {
  return useSWR(TEAS_KEY, teasFetcher, {
    revalidateOnFocus: false,
  });
}
