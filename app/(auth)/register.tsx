// app/(auth)/register.tsx
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { AuthButton } from '../../components/AuthButton';
import { PasswordInput } from '../../components/PasswordInput';
import { UsernameInput } from '../../components/UsernameInput';
import { register } from '../../data/auth';
import { COLORS, FONTS, SPACING, TYPO } from '../../styles/theme';

export default function RegisterScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!username.trim() || !password.trim() || !passwordRepeat.trim()) return;

    if (password !== passwordRepeat) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await register(username.trim(), password.trim());
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

  const disabled =
    loading ||
    !username.trim() ||
    !password.trim() ||
    !passwordRepeat.trim() ||
    password !== passwordRepeat;

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
            <Text style={styles.pageTitle}>Sign Up</Text>

            <View style={styles.formBlock}>
              <UsernameInput
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                onSubmit={handleRegister}
              />

              <PasswordInput
                value={password}
                onChangeText={setPassword}
                placeholder="Choose a password"
                onSubmit={handleRegister}
              />

              <PasswordInput
                value={passwordRepeat}
                onChangeText={setPasswordRepeat}
                placeholder="Repeat your password"
                onSubmit={handleRegister}
              />

              <AuthButton
                label="Create account"
                loading={loading}
                disabled={disabled}
                onPress={handleRegister}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable onPress={goToLogin}>
              <Text style={styles.registerText}>
                Already have an account?{' '}
                <Text style={styles.registerHighlight}>Log in</Text>
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


/**
 * AI-based code assistance was used during development
 * for guidance, explanation and debugging.
 */