// app/(home)/profile.tsx

import { useMyTeas } from '@/data/my-teas';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { COLORS, SPACING, TYPO } from '../../styles/theme';

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

  // ---------------------------
  // Animations (premium + slow)
  // ---------------------------
  const screenIn = useRef(new Animated.Value(0)).current; // 0..1
  const avatarPop = useRef(new Animated.Value(0)).current; // 0..1
  const statsIn = useRef(new Animated.Value(0)).current; // 0..1
  const listIn = useRef(new Animated.Value(0)).current; // 0..1

  const playIntro = useCallback(() => {
    screenIn.setValue(0);
    avatarPop.setValue(0);
    statsIn.setValue(0);
    listIn.setValue(0);

    Animated.sequence([
      Animated.timing(screenIn, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(avatarPop, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(statsIn, {
      toValue: 1,
      duration: 820,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
      delay: 120,
    }).start();

    Animated.timing(listIn, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
      delay: 220,
    }).start();
  }, [screenIn, avatarPop, statsIn, listIn]);

  // play on every navigation to this screen
  useFocusEffect(
    useCallback(() => {
      playIntro();
      return () => {};
    }, [playIntro])
  );

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

  const posts = Array.isArray(myTeas) ? myTeas : [];
  const totalTeas = posts.length ?? 0;

  if (isLoading && !myTeas) return <Text>Loading my teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  const displayName =
    user?.username ||
    currentUserFromTeas?.username ||
    'MounTea drinker';

  const displayBio =
    user?.bio?.trim() || 'Add a short bio in settings';

  // ✅ avatarColor from backend (fallback to primaryDark)
  const avatarBg = user?.avatarColor || COLORS.primaryDark;

  // Animated styles
  const headerAnimStyle = {
    opacity: screenIn,
    transform: [
      {
        translateY: screenIn.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  } as const;

  const avatarAnimStyle = {
    transform: [
      {
        scale: avatarPop.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  } as const;

  const statsAnimStyle = {
    opacity: statsIn,
    transform: [
      {
        translateY: statsIn.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  } as const;

  const listAnimStyle = {
    opacity: listIn,
    transform: [
      {
        translateY: listIn.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  } as const;

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
        {/* Header block */}
        <Animated.View
          style={[
            { alignItems: 'center', marginBottom: SPACING.lg },
            headerAnimStyle,
          ]}
        >
          {/* Avatar + settings */}
          <Animated.View
            style={[
              { marginBottom: SPACING.md, position: 'relative' },
              avatarAnimStyle,
            ]}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: avatarBg, // ✅ dynamic
                borderWidth: 1, // ✅ subtle edge so darkest swatch still reads
                borderColor: 'rgba(255,255,255,0.14)',
              }}
            />

            <Pressable
              onPress={goToSettings}
              style={({ pressed }) => [
                {
                  position: 'absolute',
                  right: -6,
                  top: 8,
                  padding: 8,
                  borderRadius: 999,
                  backgroundColor: COLORS.background,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={COLORS.primaryDark}
              />
            </Pressable>
          </Animated.View>

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
              opacity: 0.92,
            }}
          >
            {displayBio}
          </Text>
        </Animated.View>

        {/* Stats card */}
        <Animated.View style={statsAnimStyle}>
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
                style={{ color: COLORS.primaryTextOnDark, fontSize: 13 }}
              >
                Saved Teas
              </Text>
            </View>

            {/* Posted teas */}
            <View
              style={{ flex: 1, alignItems: 'center', paddingLeft: SPACING.md }}
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
                style={{ color: COLORS.primaryTextOnDark, fontSize: 13 }}
              >
                Posted Teas
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Posts */}
        <Animated.View style={listAnimStyle}>
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

          {posts.length > 0 ? (
            posts.map((tea: any, index: number) => {
              const start = Math.min(0.9, index * 0.12);

              const itemStyle = {
                opacity: listIn.interpolate({
                  inputRange: [start, 1],
                  outputRange: [0, 1],
                  extrapolate: 'clamp' as const,
                }),
                transform: [
                  {
                    translateY: listIn.interpolate({
                      inputRange: [start, 1],
                      outputRange: [14, 0],
                      extrapolate: 'clamp' as const,
                    }),
                  },
                ],
              };

              return (
                <Animated.View key={tea._id} style={itemStyle}>
                  <TeaRowCard
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
                </Animated.View>
              );
            })
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
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
}

/**
 * AI-based code assistance was used during development
 * for guidance, explanation and debugging.
 */
