// data/me.ts
import { API_URL } from '@/constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSWR from 'swr';

export const ME_KEY = 'me';

async function fetchMe() {
  const raw = await AsyncStorage.getItem('steap:user');
  if (!raw) return null;

  const { id } = JSON.parse(raw);
  if (!id) return null;

  const res = await fetch(`${API_URL}/users/${id}/profile`);
  if (!res.ok) throw new Error('Failed to fetch me');

  return await res.json(); // { username, bio, avatarColor, ... }
}

export default function useMe() {
  const { data, error, isLoading, mutate } = useSWR(ME_KEY, fetchMe);

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
