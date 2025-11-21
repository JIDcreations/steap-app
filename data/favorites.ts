// data/favorites.ts

// zelfde basis als in data/auth.js
const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export type ToggleResult = {
  ok: boolean;
  action: 'added' | 'removed';
  favorites: any[];
};

export async function toggleFavorite(userId: string, teaId: string): Promise<ToggleResult> {
  const res = await fetch(`${API_BASE}/api/users/${userId}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teaId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Favorite failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getFavorites(userId: string) {
  const res = await fetch(`${API_BASE}/api/users/${userId}/favorites`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get favorites failed: ${res.status} ${text}`);
  }

  // backend: returns populated tea objects array
  return res.json();
}
