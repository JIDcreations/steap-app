// app/(home)/profile.tsx

import { useMyTeas } from '@/data/my-teas';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
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
import { getCurrentUser, logout } from '../../data/auth';
import { getFavorites } from '../../data/favorites';
import { COLORS, SPACING, TYPO } from '../theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: myTeas,
    allTeas,
    error,
    isLoading,
    mutate,
    userId,
  } = useMyTeas();

  const [savedCount, setSavedCount] = useState(0);

  // auth-user uit AsyncStorage (ingelogde user)
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // favorites ophalen voor huidige user
  const loadFavorites = useCallback(async () => {
    if (!userId) {
      setSavedCount(0);
      return;
    }
    try {
      const favs = await getFavorites(userId);
      setSavedCount(Array.isArray(favs) ? favs.length : 0);
    } catch (e) {
      console.warn('Failed to load favorites', e);
      setSavedCount(0);
    }
  }, [userId]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = useCallback(() => {
    mutate();        // reload myTeas
    loadFavorites(); // reload saved teas count
  }, [mutate, loadFavorites]);

  async function handleLogout() {
    await logout();
    router.replace('/login' as Href);
  }

  // auth user ophalen telkens wanneer Profile in focus komt
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadUser() {
        try {
          setAuthLoading(true);
          const u = await getCurrentUser();
          if (isActive) {
            setAuthUser(u);
          }
        } finally {
          if (isActive) {
            setAuthLoading(false);
          }
        }
      }

      loadUser();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // unieke users op basis van alle teas (alleen als fallback voor naam)
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
    authUser?.username || currentUserFromTeas?.username || 'MounTea drinker';

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
        {/* Avatar + settings (logout) */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: SPACING.lg,
          }}
        >
          <View
            style={{
              marginBottom: SPACING.md,
              position: 'relative',
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: COLORS.primaryDark,
              }}
            />

            {/* Settings icon → voorlopig logout */}
            <Pressable
              onPress={handleLogout}
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

          {/* Naam + subtitel */}
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
            Tea drinker since 1990
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Ionicons
                name="bookmark-outline"
                size={16}
                color={COLORS.primaryTextOnDark}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: COLORS.primaryTextOnDark,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {savedCount.toString().padStart(2, '0')}
              </Text>
            </View>
            <Text
              style={{
                color: COLORS.primaryTextOnDark,
                fontSize: 13,
              }}
            >
              Saved Teas
            </Text>
          </View>

          {/* Posted teas */}
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingLeft: SPACING.md,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Ionicons
                name="leaf-outline"
                size={16}
                color={COLORS.primaryTextOnDark}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: COLORS.primaryTextOnDark,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {totalTeas.toString().padStart(2, '0')}
              </Text>
            </View>
            <Text
              style={{
                color: COLORS.primaryTextOnDark,
                fontSize: 13,
              }}
            >
              Posted Teas
            </Text>
          </View>
        </View>

        {/* Simple empty-state i.p.v. user-picker */}
        {myTeas.length === 0 && (
          <View
            style={{
              marginBottom: SPACING.lg,
              backgroundColor: COLORS.backgroundAlt,
              borderRadius: 16,
              padding: SPACING.md,
            }}
          >
            <Text
              style={{
                fontFamily: 'System',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 6,
                color: COLORS.primaryDark,
              }}
            >
              No teas yet
            </Text>
            <Text
              style={{
                fontFamily: 'System',
                fontSize: 13,
                color: COLORS.primaryDark,
              }}
            >
              You haven{"'"}t posted any teas yet. Create your first post on the
              post tab.
            </Text>
          </View>
        )}

        {/* Posts titel */}
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

        {/* Eigen teas als TeaRowCard */}
        {myTeas.length > 0 ? (
          myTeas.map((tea: any) => (
            <TeaRowCard
              key={tea._id}
              name={tea.name}
              typeName={tea.type?.name}
              rating={tea.rating}
              color={tea.color}
              saved={false} // op profiel niet als "saved" tonen
              onToggleSaved={undefined} // geen actie nodig hier
            />
          ))
        ) : (
          <Text
            style={{
              fontFamily: 'System',
              fontSize: 13,
              color: COLORS.primaryDark,
            }}
          >
            No posts yet. Share your first tea on the Home tab.
          </Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}
