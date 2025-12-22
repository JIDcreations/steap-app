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

  const user = data.user;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/** Register new user with username + password */
export async function register(username, password, avatarColor = '#C2A98B') {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, avatarColor }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Register failed');

  const user = data.user;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/** Get the currently stored user */
export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Remove the stored user (logout) */
export async function logout() {
  await AsyncStorage.removeItem(USER_KEY);
}
