import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSWRConfig } from 'swr';

import { useToastPill } from '@/components/ToastPill';
import { AuthButton } from '../../components/AuthButton';
import BioInput from '../../components/BioInput';
import { getCurrentUser, logout } from '../../data/auth';
import useBioUpdate from '../../data/bio-update';
import useMe, { ME_KEY } from '../../data/me';
import { COLORS, SPACING, TYPO } from '../theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const { user } = useMe();
  const { trigger, isMutating, error } = useBioUpdate();
  const { show, Toast } = useToastPill({ COLORS, SPACING, TYPO });

  const [userId, setUserId] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const [saving, setSaving] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animations
  const cardIn = React.useRef(new Animated.Value(0)).current;
  const saveHint = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadAuth() {
      const auth = await getCurrentUser();
      setUserId(auth?.id ?? null);
    }
    loadAuth();
  }, []);

  useEffect(() => {
    if (user?.bio !== undefined) {
      const value = user.bio || '';
      setBio(value);
      setInitialBio(value);
    }
  }, [user]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const hasChanged = bio.trim() !== initialBio.trim();
  const disabledSave = saving || isMutating || !userId || !hasChanged;

  useEffect(() => {
    Animated.timing(cardIn, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [cardIn]);

  useEffect(() => {
    if (hasChanged && !disabledSave) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(saveHint, {
            toValue: 1,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(saveHint, {
            toValue: 0,
            duration: 650,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      saveHint.stopAnimation();
      saveHint.setValue(0);
    }
  }, [hasChanged, disabledSave, saveHint]);

  async function handleSave() {
    if (!userId) return;

    try {
      setSaving(true);

      const updatedUser = await trigger(userId, bio.trim());
      mutate(ME_KEY, updatedUser, { revalidate: false });
      setInitialBio(bio.trim());

      show({ message: 'Bio saved', icon: 'checkmark-circle' });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    mutate(ME_KEY, null, { revalidate: false });
    router.replace('/login' as Href);
  }

  const toastBottom = keyboardHeight > 0 ? keyboardHeight + 16 : 34;

  return (
    <ImageBackground
      source={require('../../assets/images/MounteaBG3.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View pointerEvents="none" style={styles.bgOverlay} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={110}
        extraKeyboardSpace={-40}
        disableScrollOnKeyboardHide
      >
        <View style={styles.content}>
          <View style={styles.topBlock}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backBtn,
                { transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <Ionicons name="chevron-back" size={20} color="#ffffff" />
            </Pressable>

            <Text style={styles.pageTitle}>Settings</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.bottomBlock}>
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: cardIn,
                  transform: [
                    {
                      translateY: cardIn.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Profile</Text>
                <Text style={styles.cardSubtitle}>
                  This bio shows under your name.
                </Text>
              </View>

              <View style={styles.formBlock}>
                <BioInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Add a short bio…"
                />

                <View style={styles.buttonStack}>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: saveHint.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.02],
                          }),
                        },
                      ],
                    }}
                  >
                    <AuthButton
                      label="Save changes"
                      loading={saving || isMutating}
                      disabled={disabledSave}
                      onPress={handleSave}
                    />
                  </Animated.View>

                  <View style={styles.divider} />

                  <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>Account</Text>
                    <Text style={styles.dangerSubtitle}>
                      Logging out will remove your session on this device.
                    </Text>

                    <AuthButton
                      label="Log out"
                      loading={false}
                      disabled={false}
                      onPress={handleLogout}
                    />
                  </View>
                </View>
              </View>

              {!!error && (
                <Text style={styles.error}>
                  {String((error as any)?.message || 'Failed to update bio')}
                </Text>
              )}
            </Animated.View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* ✅ Toast always on top */}
      <View pointerEvents="box-none" style={styles.toastLayer}>
        <Toast bottom={toastBottom} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },

  toastLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  content: {
    flex: 1,
    paddingTop: 64,
  },

  topBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 18,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  pageTitle: {
    ...(TYPO.display2 ?? TYPO.screenTitle),
    color: '#ffffff',
    letterSpacing: 0.4,
  },

  bottomBlock: {
    marginTop: 40,
    paddingBottom: 88,
  },

  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(20,22,24,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cardHeader: {
    marginBottom: 14,
    gap: 6,
  },
  cardTitle: {
    ...TYPO.cardTitle,
    color: '#ffffff',
  },
  cardSubtitle: {
    ...TYPO.cardSubtitle,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 18,
  },

  formBlock: {
    gap: 14,
  },

  buttonStack: {
    marginTop: 6,
    gap: 14,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginVertical: 2,
  },

  dangerZone: {
    gap: 8,
  },
  dangerTitle: {
    ...TYPO.small,
    color: 'rgba(255,255,255,0.85)',
  },
  dangerSubtitle: {
    ...TYPO.small,
    color: 'rgba(255,255,255,0.60)',
    lineHeight: 18,
  },

  error: {
    color: '#ff5a5a',
    textAlign: 'center',
    marginTop: 12,
    ...TYPO.small,
  },
});
