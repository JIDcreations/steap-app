// data/my-teas.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTeas } from './teas';

const USER_KEY = 'userId';

async function readUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

async function writeUserId(v: string) {
  try {
    await AsyncStorage.setItem(USER_KEY, v);
  } catch {}
}

export function useMyTeas() {
  const { data: allTeas, error, isLoading, mutate } = useTeas();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    readUserId().then(setUserId);
  }, []);

  const setCurrentUserId = useCallback(async (v: string) => {
    await writeUserId(v);
    setUserId(v);
    mutate(); // refresh views depending on user filter
  }, [mutate]);

  const myTeas = useMemo(() => {
    if (!Array.isArray(allTeas) || !userId) return [];
    return allTeas.filter(t => t?.user?._id === userId);
  }, [allTeas, userId]);

  return {
    data: myTeas,
    allTeas: Array.isArray(allTeas) ? allTeas : [],
    userId,
    setCurrentUserId,
    error,
    isLoading: isLoading || !userId,
    mutate
  };
}
