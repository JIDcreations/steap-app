// app/(home)/index.tsx

import useTeaTypes from '@/data/tea-types';
import { useTeas } from '@/data/teas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCurrentUser } from '../../data/auth';
import { getFavorites, toggleFavorite } from '../../data/favorites';

import { COLORS, SPACING, TYPO } from '../theme';

// Components
import Chip from '../../components/Chip';
import SearchBar from '../../components/SearchBar';
import TeaCard from '../../components/TeaCard';
import TeaRowCard from '../../components/TeaRowCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: teas, error, isLoading, mutate } = useTeas();
  const { items: teaTypes } = useTeaTypes();

  // favorites state
  const [userId, setUserId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // animation state for "just posted" tea
  const slideAnim = useState(() => new Animated.Value(0))[0];
  const [justPostedId, setJustPostedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user?.id || user?._id) {
        setUserId(user.id || user._id);
      } else {
        setUserId(null);
      }
    })();
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;
    const favs = await getFavorites(userId);
    const ids = new Set<string>(favs.map((t: any) => t._id));
    setSavedIds(ids);
  }, [userId]);

  useEffect(() => {
    if (userId) loadFavorites();
  }, [userId, loadFavorites]);

  const isSaved = useCallback(
    (teaId: string) => savedIds.has(teaId),
    [savedIds]
  );

  const handleToggleSaved = useCallback(
    async (teaId: string) => {
      if (!userId) return;

      // optimistic UI
      setSavedIds(prev => {
        const next = new Set(prev);

        if (next.has(teaId)) {
          next.delete(teaId);
        } else {
          next.add(teaId);
        }

        return next;
      });

      try {
        const res = await toggleFavorite(userId, teaId);
        const ids = new Set<string>(
          (res.favorites as any[]).map((t: any) => t._id)
        );
        setSavedIds(ids);
      } catch {
        await loadFavorites();
      }
    },
    [userId, loadFavorites]
  );

  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  const [q, setQ] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    mutate();
    refreshFavorites();
  }, [mutate, refreshFavorites]);

  // When Home becomes active, check if there's a "last posted" id to animate
  useFocusEffect(
    useCallback(() => {
      let alive = true;

      (async () => {
        // refresh when returning to Home
        mutate();
        refreshFavorites();

        const id = await AsyncStorage.getItem('lastPostedTeaId');
        if (!alive) return;

        if (id) {
          setJustPostedId(id);

          // Dynamic, snappy spring
          slideAnim.setValue(0);
          Animated.spring(slideAnim, {
            toValue: 1,
            damping: 14, // lower = more bounce, higher = calmer
            stiffness: 180, // higher = snappier
            mass: 0.9,
            useNativeDriver: true,
          }).start();

          // play once
          await AsyncStorage.removeItem('lastPostedTeaId');
        }
      })();

      return () => {
        alive = false;
      };
    }, [mutate, refreshFavorites, slideAnim])
  );

  const filtered = useMemo(() => {
    if (!Array.isArray(teas)) return [];
    const needle = q.toLowerCase();
    return teas.filter((t: any) => {
      const name = (t.name ?? '').toLowerCase();
      const note = (t.note ?? '').toLowerCase();
      const type = (t.type?.name ?? '').toLowerCase();
      const user = (t.user?.username ?? '').toLowerCase();

      const matchesText =
        !needle ||
        name.includes(needle) ||
        note.includes(needle) ||
        type.includes(needle) ||
        user.includes(needle);

      const matchesType =
        !selectedType || type === selectedType.toLowerCase();

      return matchesText && matchesType;
    });
  }, [teas, q, selectedType]);

  // 3 meest recente (teas komen al gesorteerd uit backend)
  const recentTeas = useMemo(() => {
    if (!Array.isArray(filtered)) return [];
    return filtered.slice(0, 3);
  }, [filtered]);

  if (isLoading) return <Text>Loading teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  return (
    <ImageBackground
      source={require('../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{
        resizeMode: 'cover',
        opacity: 0.45,
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.xl,
        }}
      >
        {/* Titel */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: SPACING.xl,
          }}
        >
          <Text
            style={[
              TYPO.display1,
              {
                color: COLORS.primaryDark,
                textTransform: 'uppercase',
              },
            ]}
          >
            ATEATUDE
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ marginBottom: SPACING.md }}>
          <SearchBar
            value={q}
            onChangeText={setQ}
            onClear={() => setQ('')}
            placeholder="Search for teas"
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            marginBottom: SPACING.lg,
            marginHorizontal: -SPACING.lg,
          }}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Chip
              label="All"
              active={!selectedType}
              onPress={() => setSelectedType(null)}
            />

            {teaTypes.map((type: any) => (
              <Chip
                key={type._id}
                label={type.name}
                active={selectedType === type.name}
                onPress={() =>
                  setSelectedType(
                    selectedType === type.name ? null : type.name
                  )
                }
              />
            ))}
          </View>
        </ScrollView>

        {/* Teacards – horizontale scroller */}
        {filtered && filtered.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              marginBottom: SPACING.xl,
              marginHorizontal: -SPACING.lg,
            }}
            contentContainerStyle={{
              paddingHorizontal: SPACING.lg,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {filtered.map((tea: any) => (
                <TeaCard
                  key={tea._id}
                  name={tea.name}
                  typeName={tea.type?.name}
                  rating={tea.rating}
                  color={tea.color}
                  saved={isSaved(tea._id)}
                  onToggleSaved={() => handleToggleSaved(tea._id)}
                  onPressCard={() =>
                    router.push({
                      pathname: '/tea/[id]',
                      params: { id: tea._id },
                    })
                  }
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={{ paddingTop: 24 }}>
            <Text style={{ color: COLORS.textSoft }}>
              No teas match your filters.
            </Text>
          </View>
        )}

        {/* Recently posted — verticale wide cards */}
        {recentTeas.length > 0 && (
          <View style={{ marginTop: SPACING.lg }}>
            <Text
              style={[
                TYPO.cardTitle,
                { color: COLORS.primaryDark, marginBottom: SPACING.sm },
              ]}
            >
              Recently posted
            </Text>

            {recentTeas.map((tea: any) => {
              const isJustPosted = justPostedId === tea._id;

              const animatedStyle = isJustPosted
                ? {
                    opacity: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-28, 0],
                        }),
                      },
                      {
                        scale: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.98, 1],
                        }),
                      },
                    ],
                  }
                : undefined;

              const row = (
                <TeaRowCard
                  key={`recent-${tea._id}`}
                  name={tea.name}
                  typeName={tea.type?.name}
                  rating={tea.rating}
                  color={tea.color}
                  saved={isSaved(tea._id)}
                  onToggleSaved={() => handleToggleSaved(tea._id)}
                  onPressCard={() =>
                    router.push({
                      pathname: '/tea/[id]',
                      params: { id: tea._id },
                    })
                  }
                />
              );

              return isJustPosted ? (
                <Animated.View
                  key={`recent-anim-${tea._id}`}
                  style={animatedStyle}
                >
                  {row}
                </Animated.View>
              ) : (
                row
              );
            })}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}
