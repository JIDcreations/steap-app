// data/favorites.ts
import { API_URL } from '@/constants/Api';

export type ToggleResult = {
  ok: boolean;
  action: 'added' | 'removed';
  favorites: any[];
};

export async function toggleFavorite(
  userId: string,
  teaId: string
): Promise<ToggleResult> {
  const res = await fetch(`${API_URL}/users/${userId}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teaId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Favorite failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getFavorites(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}/favorites`);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Get favorites failed: ${res.status} ${text}`);
  }

  return res.json();
}
