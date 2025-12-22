// app/(home)/settings.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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

import { AuthButton } from '../../components/AuthButton';
import BioInput from '../../components/BioInput';
import { logout } from '../../data/auth';
import useBioUpdate from '../../data/bio-update';
import useMe, { ME_KEY } from '../../data/me';
import { COLORS, SPACING, TYPO } from '../theme';

// Toast
import { useToastPill } from '@/components/ToastPill';

export default function SettingsScreen() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const { user } = useMe();
  const { trigger, isMutating, error } = useBioUpdate();

  const { show, Toast } = useToastPill({ COLORS, SPACING, TYPO });

  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ track keyboard height so toast can sit above it
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const userId = useMemo(() => {
    if (!user) return null;
    return (user as any).id || (user as any)._id || null;
  }, [user]);

  useEffect(() => {
    if (user && (user as any).bio !== undefined) {
      setBio(((user as any).bio as string) || '');
    }
  }, [user]);

  async function handleSave() {
    if (!userId) return;

    try {
      setSaving(true);

      const updatedUser = await trigger(userId, bio.trim());
      mutate(ME_KEY, updatedUser, { revalidate: false });

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

  const disabledSave = saving || isMutating || !userId;

  // ✅ toast bottom: if keyboard open -> sit above it, else normal bottom
  const toastBottom = keyboardHeight > 0 ? keyboardHeight + 16 : 34;

  return (
    <ImageBackground
      source={require('../../assets/images/MounteaBG3.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Toast overlay (above keyboard) */}
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
          {/* Top block: SETTINGS + back */}
          <View style={styles.topBlock}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#ffffff" />
            </Pressable>

            <Text style={styles.pageTitle}>SETTINGS</Text>

            <View style={{ width: 44, height: 44 }} />
          </View>

          {/* Bottom block */}
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
    textAlign: 'center',
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
