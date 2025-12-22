// data/auth.js
import { API_URL } from '@/constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'steap:user';

/** Log in user with username + password */
export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');

  // ✅ store ONLY the id
  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: data.user.id })
  );

  return data.user;
}

/** Register new user */
export async function register(username, password, avatarColor = '#C2A98B') {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, avatarColor }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Register failed');

  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: data.user.id })
  );

  return data.user;
}

/** Get current auth session (ONLY id) */
export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null; // { id }
}

/** Logout */
export async function logout() {
  await AsyncStorage.removeItem(USER_KEY);
}
