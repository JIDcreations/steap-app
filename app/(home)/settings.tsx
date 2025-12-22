import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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

  // ✅ load auth id (SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    async function loadAuth() {
      const auth = await getCurrentUser();
      setUserId(auth?.id ?? null);
    }
    loadAuth();
  }, []);

  // ✅ init bio from backend user
  useEffect(() => {
    if (user?.bio !== undefined) {
      const value = user.bio || '';
      setBio(value);
      setInitialBio(value);
    }
  }, [user]);

  // keyboard tracking (toast position)
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

  const hasChanged = bio.trim() !== initialBio.trim();

  const disabledSave =
    saving ||
    isMutating ||
    !userId ||
    !hasChanged;

  const toastBottom = keyboardHeight > 0 ? keyboardHeight + 16 : 34;

  return (
    <ImageBackground
      source={require('../../assets/images/MounteaBG3.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <Toast bottom={toastBottom} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={110}
        extraKeyboardSpace={-40}
        disableScrollOnKeyboardHide
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.topBlock}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#ffffff" />
            </Pressable>

            <Text style={styles.pageTitle}>SETTINGS</Text>

            <View style={{ width: 44 }} />
          </View>

          {/* Form */}
          <View style={styles.bottomBlock}>
            <View style={styles.formBlock}>
              <BioInput
                value={bio}
                onChangeText={setBio}
                placeholder="Add a short bio…"
              />

              <AuthButton
                label="Save"
                loading={saving || isMutating}
                disabled={disabledSave}
                onPress={handleSave}
              />

              <AuthButton
                label="Log out"
                loading={false}
                disabled={false}
                onPress={handleLogout}
              />
            </View>

            {!!error && (
              <Text style={styles.error}>
                {String((error as any)?.message || 'Failed to update bio')}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  pageTitle: {
    ...TYPO.display2,
    color: '#ffffff',
    letterSpacing: 2,
  },
  bottomBlock: {
    marginTop: 'auto',
    paddingBottom: 100,
    gap: 30,
  },
  formBlock: {
    gap: 30,
  },
  error: {
    color: '#ff5a5a',
    textAlign: 'center',
    marginTop: SPACING.sm,
    ...TYPO.small,
  },
});
