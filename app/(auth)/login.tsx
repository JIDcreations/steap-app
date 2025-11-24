// app/(auth)/login.tsx
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { login } from '../../data/auth';
import { COLORS, FONTS, RADIUS, SPACING, TYPO } from '../theme';

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!username.trim()) return;

    try {
      setLoading(true);
      setError(null);

      await login(username.trim());
      router.replace('/' as Href);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function goToRegister() {
    router.push('/register' as Href);
  }

  const disabled = loading || !username.trim();

  return (
    <ImageBackground
      source={require('../../assets/images/MounteaLoginBG.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.content}>
        {/* Top block: brand + logo */}
        <View style={styles.topBlock}>
          <Text style={styles.brandTitle}>MOUNTEA</Text>

          <Image
            source={require('../../assets/images/MounteaLogo.png')}
            style={styles.logo}
          />
        </View>

        {/* Bottom block: title + form + links */}
        <View style={styles.bottomBlock}>
          <Text style={styles.pageTitle}>Log In</Text>

          <View style={styles.formBlock}>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#7D9B93"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              onSubmitEditing={handleLogin}
            />

            <Pressable
              disabled={disabled}
              onPress={handleLogin}
              style={[styles.button, disabled && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#FDFBFC" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Pressable>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={goToRegister}>
            <Text style={styles.registerText}>
              Don&apos;t have an account?{' '}
              <Text style={styles.registerHighlight}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.xl,
  },

  content: {
    flex: 1,
    paddingTop: 76, // MOUNTEA 56px from top
  },

  topBlock: {
    alignItems: 'center',
    gap: 60, // 60px tussen MOUNTEA en logo
    marginTop: 20,
  },

  /* TITLE ABOVE LOGO */
  brandTitle: {
    ...TYPO.display1, // H1: Playfair bold 32 + letterspacing
    color: '#ffffff',
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },

  bottomBlock: {
    marginTop: 'auto', // push naar onderkant
    paddingBottom: 100, // 100px van bottom
    gap: 30, // spacing tussen "Log In", form, error, link
  },

  /* DISPLAY-2 */
  pageTitle: {
    ...TYPO.display2, // Playfair 24
    color: '#ffffff',
    textAlign: 'center',
  },

  formBlock: {
    gap: 30, // 30px tussen input en button
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    color: '#ffffff',
  },

  button: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    ...TYPO.bodyMedium,
    color: COLORS.textOnAccent,
  },

  error: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: SPACING.sm,
    ...TYPO.small,
  },

  registerText: {
    ...TYPO.small,
    color: '#ffffff',
    textAlign: 'center',
  },

  registerHighlight: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyMedium,
  },
});
