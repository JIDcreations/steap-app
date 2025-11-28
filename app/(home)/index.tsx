// app/(home)/index.tsx

import useTeaTypes from '@/data/tea-types';
import { useTeas } from '@/data/teas';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCurrentUser } from '../../data/auth';
import { getFavorites, toggleFavorite } from '../../data/favorites';

import { COLORS, SPACING, TYPO } from '../theme';

// Components
import Chip from '../../components/Chip';
import SearchBar from '../../components/SearchBar';

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
          style={{ marginBottom: SPACING.md }}
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

        {/* Teas List – voorlopig nog basic */}
        {filtered && filtered.length > 0 ? (
          filtered.map((tea: any) => {
            const saved = isSaved(tea._id);
            return (
              <View
                key={tea._id}
                style={{
                  marginBottom: SPACING.sm,
                  borderBottomWidth: 1,
                  borderColor: COLORS.borderSoft,
                  paddingBottom: SPACING.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: COLORS.text,
                    }}
                  >
                    {tea.name}
                  </Text>
                  <Text style={{ color: COLORS.textSoft }}>
                    {tea.type?.name || 'Unknown type'} •{' '}
                    {tea.user?.username ?? '—'}
                  </Text>
                  {tea.note ? (
                    <Text style={{ color: COLORS.textSoft }}>
                      {tea.note}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => handleToggleSaved(tea._id)}
                  hitSlop={8}
                  style={{ padding: 6 }}
                >
                  <Ionicons
                    name={
                      saved ? 'checkmark-circle' : 'add-circle-outline'
                    }
                    size={24}
                    color={COLORS.accent}
                  />
                </Pressable>
              </View>
            );
          })
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
