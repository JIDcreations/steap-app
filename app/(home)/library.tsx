// app/(home)/library.tsx

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
import { getFavorites } from '../../data/favorites';
import { COLORS, SPACING, TYPO } from '../theme';

// Components
import useTeaTypes from '@/data/tea-types';
import Chip from '../../components/Chip';
import SearchBar from '../../components/SearchBar';
import TeaCard from '../../components/TeaCard';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();

  const { items: teaTypes } = useTeaTypes();

  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search + filters
  const [q, setQ] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Load current user
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user?.id || user?._id) {
        setUserId(user.id || user._id);
      }
    })();
  }, []);

  // Fetch favorites
  const loadFavorites = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const favs = await getFavorites(userId);
      setFavorites(Array.isArray(favs) ? favs : []);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = () => loadFavorites();

  // FILTERING
  const filtered = useMemo(() => {
    if (!favorites) return [];

    const needle = q.toLowerCase();

    return favorites.filter((t: any) => {
      const name = (t.name ?? '').toLowerCase();
      const note = (t.note ?? '').toLowerCase();
      const type = (t.type?.name ?? '').toLowerCase();

      const matchesText =
        !needle || name.includes(needle) || note.includes(needle) || type.includes(needle);

      const matchesType =
        !selectedType || type === selectedType.toLowerCase();

      return matchesText && matchesType;
    });
  }, [favorites, q, selectedType]);

  return (
    <ImageBackground
      source={require('../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover', opacity: 0.35 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingHorizontal: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.xl,
        }}
      >
        {/* Titel */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
          <Text
            style={[
              TYPO.display1,
              { color: COLORS.primaryDark, textTransform: 'uppercase' },
            ]}
          >
            Library
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ marginBottom: SPACING.md }}>
          <SearchBar
            value={q}
            onChangeText={setQ}
            onClear={() => setQ('')}
            placeholder="Search in your saved teas"
          />
        </View>

        {/* Chips */}
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

            {(teaTypes as any[]).map((type: any) => (
              <Chip
                key={type._id}
                label={type.name}
                active={selectedType === type.name}
                onPress={() =>
                  setSelectedType(selectedType === type.name ? null : type.name)
                }
              />
            ))}
          </View>
        </ScrollView>

        {/* GRID: 2 columns, 20px vertical spacing */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {filtered.map((tea: any) => (
            <View
              key={tea._id}
              style={{
                width: '48%',
                marginBottom: 20, // ← 20px spacing tussen kaarten
              }}
            >
              <TeaCard
                name={tea.name}
                typeName={tea.type?.name}
                rating={tea.rating}
                color={tea.color}
                saved={true}       // In Library is alles saved
                onToggleSaved={() => {}} // Geen toggle hier
              />
            </View>
          ))}
        </View>

        {filtered.length === 0 && !isLoading && (
          <Text style={{ color: COLORS.primaryDark, marginTop: 20 }}>
            No saved teas found.
          </Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}
