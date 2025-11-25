// app/(auth)/register.tsx
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

import { register } from '../../data/auth';
import { COLORS, FONTS, RADIUS, SPACING, TYPO } from '../theme';

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

  const disabled = loading || !username.trim();

  return (
    <ImageBackground
      source={require('../../assets/images/MounteaBG3.png')}
      style={styles.bg}
      resizeMode="cover"
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
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor="#7D9B93"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              onSubmitEditing={handleRegister}
            />

            <Pressable
              disabled={disabled}
              onPress={handleRegister}
              style={[styles.button, disabled && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#FDFBFC" />
              ) : (
                <Text style={styles.buttonText}>Create account</Text>
              )}
            </Pressable>
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
