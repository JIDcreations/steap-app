// data/my-teas.ts
import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from './auth';
import { useTeas } from './teas';

export function useMyTeas() {
  const { data: allTeas, error, isLoading, mutate } = useTeas();

  const [userId, setUserId] = useState<string | null>(null);

  // haal ingelogde user uit AsyncStorage
  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (user?.id || user?._id) {
        setUserId(user.id || user._id);
      }
    }
    load();
  }, []);

  // Filter op teas van ingelogde user
  const myTeas = useMemo(() => {
    if (!Array.isArray(allTeas) || !userId) return [];
    return allTeas.filter((t) => {
      const u = t.user;
      if (!u) return false;

      if (typeof u === 'string') return u === userId;
      return u._id === userId;
    });
  }, [allTeas, userId]);

  return {
    data: myTeas,                           // alleen teas van ingelogde user
    allTeas: Array.isArray(allTeas) ? allTeas : [],
    userId,
    setCurrentUserId: setUserId,            // nog laten staan voor debug
    error,
    isLoading: isLoading || !userId,
    mutate,
  };
}
