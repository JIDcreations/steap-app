// app/(home)/index.tsx

import useTeaTypes from '@/data/tea-types';
import { useTeas } from '@/data/teas';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const { data: teas, error, isLoading, mutate } = useTeas();
  const { items: teaTypes, isLoading: loadingTypes } = useTeaTypes();

  // favorites state
  const [userId, setUserId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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
        next.has(teaId) ? next.delete(teaId) : next.add(teaId);
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
          style={{ marginBottom: SPACING.lg }}
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
            style={{ marginBottom: SPACING.xl }}
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
      </ScrollView>
    </ImageBackground>
  );
}
