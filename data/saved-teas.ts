// data/saved-teas.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTeas } from './teas';

const KEY = 'savedTeaIds';

async function readSavedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeSavedIds(ids: string[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
}

export function useSavedTeas() {
  const { data: allTeas, error, isLoading, mutate: mutateTeas } = useTeas();
  const [ids, setIds] = useState<string[]>([]);

  // load once on mount
  useEffect(() => {
    readSavedIds().then(setIds);
  }, []);

  const reloadSaved = useCallback(async () => {
    const fresh = await readSavedIds();
    setIds(fresh);
  }, []);

  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const toggleSaved = useCallback(async (id: string) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      writeSavedIds(next); // persist
      return next;
    });
  }, []);

  const savedTeas = useMemo(() => {
    if (!Array.isArray(allTeas) || ids.length === 0) return [];
    const map = new Map(allTeas.map((t: any) => [t._id, t]));
    return ids.map(id => map.get(id)).filter(Boolean);
  }, [allTeas, ids]);

  // refresh now reloads BOTH server data and saved IDs
  const refresh = useCallback(() => {
    reloadSaved();
    mutateTeas();
  }, [reloadSaved, mutateTeas]);

  return { savedIds: ids, isSaved, toggleSaved, savedTeas, isLoading, error, refresh, reloadSaved };
}
