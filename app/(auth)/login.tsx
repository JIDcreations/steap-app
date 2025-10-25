import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { login } from '../../data/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim()) return;
    try {
      setLoading(true);
      await login(username.trim());
      router.replace('/'); // go to home after login
    
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>STEAP</Text>
      <Text style={{ opacity: 0.7 }}>Enter a username to continue</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 10,
          fontSize: 16,
        }}
        onSubmitEditing={handleLogin}
      />

      <Pressable
        onPress={handleLogin}
        disabled={loading || !username.trim()}
        style={{
          backgroundColor: '#000',
          opacity: loading || !username.trim() ? 0.4 : 1,
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
        }}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600' }}>Continue</Text>
        )}
      </Pressable>
    </View>
  );
}
