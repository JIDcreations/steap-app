// app/(auth)/login.tsx
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { AuthButton } from '../../components/AuthButton';
import { UsernameInput } from '../../components/UsernameInput';
import { login } from '../../data/auth';
import { COLORS, FONTS, SPACING, TYPO } from '../theme';

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // nieuw
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setError(null);

      await login(username.trim(), password.trim());
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

  const disabled = loading || !username.trim() || !password.trim();

  return (
    <ImageBackground
      source={require('../../assets/images/MounteaBG3.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={32}
      >
        <View style={styles.content}>
          {/* Top block: brand + logo */}
          <View style={styles.topBlock}>
            <Text style={styles.brandTitle}>ATEATUDE</Text>

            <Image
              source={require('../../assets/images/MounteaLogo.png')}
              style={styles.logo}
            />
          </View>

          {/* Bottom block: title + form + links */}
          <View style={styles.bottomBlock}>
            <Text style={styles.pageTitle}>Log In</Text>

            <View style={styles.formBlock}>
              <UsernameInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                onSubmit={handleLogin}
              />

              {/* Password input */}
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                style={styles.passwordInput}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <AuthButton
                label="Login"
                loading={loading}
                disabled={disabled}
                onPress={handleLogin}
              />
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
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.xl,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    paddingTop: 76,
  },

  topBlock: {
    alignItems: 'center',
    gap: 60,
    marginTop: 20,
  },

  brandTitle: {
    ...TYPO.display1,
    color: '#ffffff',
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },

  bottomBlock: {
    marginTop: 'auto',
    paddingBottom: 100,
    gap: 30,
  },

  pageTitle: {
    ...TYPO.display2,
    color: '#ffffff',
    textAlign: 'center',
  },

  formBlock: {
    gap: 30,
  },

  passwordInput: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 999,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...TYPO.body,
    color: '#ffffff',
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
