// app/(auth)/register.tsx
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { register } from '../../data/auth';

export default function RegisterScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!username.trim()) return;

    try {
      setLoading(true);
      setError(null);

      await register(username.trim());

      // na register meteen ingelogd → naar home
      router.replace('/' as Href);
    } catch (e: any) {
      setError(e.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    router.push('/login' as Href);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 20,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: '700' }}>MounTea</Text>
      <Text style={{ opacity: 0.7 }}>Choose a username to create an account</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 14,
          borderRadius: 12,
          fontSize: 16,
        }}
        onSubmitEditing={handleRegister}
      />

      <Pressable
        onPress={handleRegister}
        disabled={loading || !username.trim()}
        style={{
          backgroundColor: '#243235',
          opacity: loading || !username.trim() ? 0.4 : 1,
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600' }}>Create account</Text>
        )}
      </Pressable>

      {error && (
        <Text style={{ color: 'red', marginTop: -10 }}>
          {error}
        </Text>
      )}

      <Pressable onPress={goToLogin}>
        <Text style={{ textDecorationLine: 'underline', opacity: 0.7 }}>
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}
