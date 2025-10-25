// data/teas.ts
import useSWR from 'swr';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is missing. Add it to .env and restart: npx expo start -c');
}

const rawFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText} :: ${body}`);
  }
  return res.json();
};

/**
 * Normalizes the API so the hook always returns an array of teas.
 * If the server returns { items: [...] }, we take .items; if it ever returns an array directly, we use it as-is.
 */
const teasFetcher = async (url: string) => {
  const data = await rawFetcher(url);
  return Array.isArray(data) ? data : data?.items ?? [];
};

export function useTeas() {
  return useSWR(`${API_URL}/api/teas`, teasFetcher, {
    revalidateOnFocus: false,
  });
}
