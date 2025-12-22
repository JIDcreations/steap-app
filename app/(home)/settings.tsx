// app/(home)/settings.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSWRConfig } from 'swr';

import { logout } from '../../data/auth';
import useBioUpdate from '../../data/bio-update';
import useMe, { ME_KEY } from '../../data/me';
import { COLORS, SPACING, TYPO } from '../theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const { user, isLoading } = useMe();
  const { trigger, isMutating, error } = useBioUpdate();

  const [bio, setBio] = useState('');

  const userId = useMemo(() => {
    if (!user) return null;
    return (user as any).id || (user as any)._id || null;
  }, [user]);

  useEffect(() => {
    if (user && (user as any).bio !== undefined) {
      setBio(((user as any).bio as string) || '');
    }
  }, [user]);

  async function onSaveBio() {
    try {
      if (!userId) return;

      const updatedUser = await trigger(userId, bio);

      // Update SWR cache for "me" so other screens update instantly
      mutate(ME_KEY, updatedUser, { revalidate: false });

      Alert.alert('Saved', 'Your bio was updated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update bio');
    }
  }

  async function onLogout() {
    try {
      await logout();

      // Clear SWR cache for "me"
      mutate(ME_KEY, null, { revalidate: false });

      // Adjust this route if your login route is different
      router.replace('/login' as any);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Logout failed');
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={{
        paddingTop: insets.top + SPACING.lg,
        paddingBottom: insets.bottom + SPACING.lg,
        paddingHorizontal: SPACING.lg,
        gap: SPACING.lg,
      }}
    >
      <Text style={[TYPO.screenTitle, { color: COLORS.teaCardText }]}>
        Settings
      </Text>

      <View style={{ gap: SPACING.sm }}>
        <Text style={[TYPO.cardSubtitle, { color: COLORS.teaCardText }]}>
          Bio
        </Text>

        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Add a short bio…"
          placeholderTextColor={COLORS.teaCardText}
          multiline
          style={{
            minHeight: 96,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            backgroundColor: COLORS.backgroundAlt,
            borderWidth: 1,
            borderColor: COLORS.border,
            color: COLORS.teaCardText,
            textAlignVertical: 'top',
          }}
        />

        {!!error && (
          <Text style={[TYPO.body, { color: COLORS.danger }]}>
            {String((error as any)?.message || 'Something went wrong')}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSaveBio}
          disabled={isLoading || !userId || isMutating}
          style={{
            marginTop: SPACING.sm,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            backgroundColor: COLORS.primaryDark,
            opacity: isLoading || !userId || isMutating ? 0.6 : 1,
          }}
        >
          <Text style={[TYPO.body, { color: COLORS.primaryTextOnDark }]}>
            {isMutating ? 'Saving…' : 'Save bio'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: SPACING.sm }}>
        <Text style={[TYPO.cardSubtitle, { color: COLORS.teaCardText }]}>
          Account
        </Text>

        <TouchableOpacity
          onPress={onLogout}
          style={{
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            backgroundColor: COLORS.teaCardDark,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text style={[TYPO.body, { color: COLORS.teaCardText }]}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
