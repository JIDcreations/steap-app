// data/auth.js of data/auth.ts (maakt niet uit, Expo kan JS importeren)
import AsyncStorage from '@react-native-async-storage/async-storage';

// use the same variable you already have working
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const USER_KEY = 'steap:user';

/** Log in user by username */
export async function login(username) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');

  const user = data.user;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/** Register new user by username */
export async function register(username, avatarColor = '#C2A98B') {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, avatarColor }),
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
