// data/favorites.ts
import { API_URL } from '../constants/Api';

export type ToggleResult = {
  ok: boolean;
  action: 'added' | 'removed';
  favorites: any[];
};

export async function toggleFavorite(userId: string, teaId: string): Promise<ToggleResult> {
  const res = await fetch(`${API_URL}/users/${userId}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teaId }),
  });
  if (!res.ok) throw new Error(`Favorite failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getFavorites(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}/favorites`);
  if (!res.ok) throw new Error(`Get favorites failed: ${res.status}`);
  return res.json(); // returns populated tea objects
}
