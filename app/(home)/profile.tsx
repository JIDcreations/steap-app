// app/(home)/profile.tsx

import { useMyTeas } from '@/data/my-teas';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TeaRowCard from '../../components/TeaRowCard';
import { getFavorites, toggleFavorite } from '../../data/favorites';
import useMe from '../../data/me';
import { COLORS, SPACING, TYPO } from '../theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user } = useMe();

  const {
    data: myTeas,
    allTeas,
    error,
    isLoading,
    mutate,
    userId,
  } = useMyTeas();

  const [savedCount, setSavedCount] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // favorites ophalen voor huidige user
  const loadFavorites = useCallback(async () => {
    if (!userId) {
      setSavedCount(0);
      setSavedIds(new Set());
      return;
    }
    try {
      const favs = await getFavorites(userId);
      const list = Array.isArray(favs) ? favs : [];
      setSavedCount(list.length);
      setSavedIds(new Set(list.map((t: any) => t._id)));
    } catch {
      setSavedCount(0);
      setSavedIds(new Set());
    }
  }, [userId]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = useCallback(() => {
    mutate();
    loadFavorites();
  }, [mutate, loadFavorites]);

  function goToSettings() {
    router.push('/(home)/settings' as any);
  }

  const handleToggleSaved = useCallback(
    async (teaId: string) => {
      if (!userId) return;
      try {
        const res = await toggleFavorite(userId, teaId);
        const favorites = Array.isArray(res.favorites) ? res.favorites : [];
        setSavedCount(favorites.length);
        setSavedIds(new Set(favorites.map((t: any) => t._id)));
      } catch {
        loadFavorites();
      }
    },
    [userId, loadFavorites]
  );

  // fallback username uit teas (alleen als backend user nog niet geladen is)
  const distinctUsers = useMemo(() => {
    const map = new Map<string, { _id: string; username: string }>();
    for (const t of allTeas) {
      const u = t?.user;
      if (u?._id && !map.has(u._id)) {
        map.set(u._id, { _id: u._id, username: u.username ?? 'Unknown' });
      }
    }
    return Array.from(map.values());
  }, [allTeas]);

  const currentUserFromTeas = useMemo(() => {
    if (!userId) return null;
    return distinctUsers.find(u => u._id === userId) ?? null;
  }, [distinctUsers, userId]);

  const totalTeas = myTeas?.length ?? 0;

  if (isLoading && !myTeas) return <Text>Loading my teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  const displayName =
    user?.username ||
    currentUserFromTeas?.username ||
    'MounTea drinker';

  const displayBio =
    user?.bio?.trim() || 'Add a short bio in settings';

  return (
    <ImageBackground
      source={require('../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover', opacity: 0.35 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={!!isLoading} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.xl,
        }}
      >
        {/* Avatar + settings */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
          <View style={{ marginBottom: SPACING.md, position: 'relative' }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: COLORS.primaryDark,
              }}
            />

            <Pressable
              onPress={goToSettings}
              style={{
                position: 'absolute',
                right: -6,
                top: 8,
                padding: 8,
                borderRadius: 999,
                backgroundColor: COLORS.background,
              }}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={COLORS.primaryDark}
              />
            </Pressable>
          </View>

          <Text
            style={[
              TYPO.display1,
              {
                color: COLORS.primaryDark,
                textAlign: 'center',
                textTransform: 'none',
              },
            ]}
          >
            {displayName}
          </Text>

          <Text
            style={{
              fontFamily: 'System',
              fontSize: 14,
              color: COLORS.primaryDark,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {displayBio}
          </Text>
        </View>

        {/* Stats card */}
        <View
          style={{
            backgroundColor: COLORS.primaryDark,
            borderRadius: 18,
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: SPACING.lg,
          }}
        >
          {/* Saved teas */}
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              borderRightWidth: 1,
              borderRightColor: COLORS.backgroundAlt,
              paddingRight: SPACING.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons
                name="bookmark-outline"
                size={16}
                color={COLORS.primaryTextOnDark}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: COLORS.primaryTextOnDark, fontWeight: '700', fontSize: 16 }}>
                {savedCount.toString().padStart(2, '0')}
              </Text>
            </View>
            <Text style={{ color: COLORS.primaryTextOnDark, fontSize: 13 }}>
              Saved Teas
            </Text>
          </View>

          {/* Posted teas */}
          <View style={{ flex: 1, alignItems: 'center', paddingLeft: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons
                name="leaf-outline"
                size={16}
                color={COLORS.primaryTextOnDark}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: COLORS.primaryTextOnDark, fontWeight: '700', fontSize: 16 }}>
                {totalTeas.toString().padStart(2, '0')}
              </Text>
            </View>
            <Text style={{ color: COLORS.primaryTextOnDark, fontSize: 13 }}>
              Posted Teas
            </Text>
          </View>
        </View>

        {/* Posts */}
        <Text
          style={{
            fontFamily: 'System',
            fontWeight: '600',
            fontSize: 16,
            color: COLORS.primaryDark,
            marginBottom: SPACING.sm,
          }}
        >
          Posts
        </Text>

        {myTeas.length > 0 ? (
          myTeas.map((tea: any) => (
            <TeaRowCard
              key={tea._id}
              name={tea.name}
              typeName={tea.type?.name}
              rating={tea.rating}
              color={tea.color}
              saved={savedIds.has(tea._id)}
              onToggleSaved={() => handleToggleSaved(tea._id)}
              onPressCard={() =>
                router.push({
                  pathname: '/tea/[id]',
                  params: { id: tea._id },
                })
              }
            />
          ))
        ) : (
          <Text style={{ fontFamily: 'System', fontSize: 13, color: COLORS.primaryDark }}>
            No posts yet. Share your first tea on the Home tab.
          </Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}
