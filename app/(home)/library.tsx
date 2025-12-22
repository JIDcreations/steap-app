// app/(home)/library.tsx

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import useTeaTypes from '@/data/tea-types';
import { useTeas } from '@/data/teas';
import Chip from '../../components/Chip';
import SearchBar from '../../components/SearchBar';
import TeaCard from '../../components/TeaCard';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { items: teaTypes } = useTeaTypes();
  const { data: allTeas, isLoading: teasLoading, mutate: mutateTeas } =
    useTeas();

  const [userId, setUserId] = useState<string | null>(null);

  // Saved teas
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  // Posted toggle
  const [postedOnly, setPostedOnly] = useState(false);

  // Search + filters
  const [q, setQ] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const isObjectId = useCallback((v: any) => {
    return typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
  }, []);

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
      setFavoritesLoading(true);
      const favs = await getFavorites(userId);
      setFavorites(Array.isArray(favs) ? favs : []);
    } finally {
      setFavoritesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Toggle favorite
  const handleToggleSaved = useCallback(
    async (teaId: string) => {
      if (!userId) return;

      try {
        const res = await toggleFavorite(userId, teaId);
        const nextFavs = Array.isArray(res.favorites) ? res.favorites : [];
        setFavorites(nextFavs);
        mutateTeas();
      } catch (e) {
        console.warn('Failed to toggle favorite in library', e);
        loadFavorites();
      }
    },
    [userId, loadFavorites, mutateTeas]
  );

  // Saved ids (for posted mode)
  const savedIds = useMemo(() => {
    return new Set<string>(
      (favorites ?? []).map((t: any) => t?._id).filter(Boolean)
    );
  }, [favorites]);

  // Lookup maps
  const typeNameById = useMemo(() => {
    const map = new Map<string, string>();
    (teaTypes as any[]).forEach((tt: any) => {
      if (tt?._id && tt?.name) map.set(String(tt._id), String(tt.name));
    });
    return map;
  }, [teaTypes]);

  const typeIdByNameLower = useMemo(() => {
    const map = new Map<string, string>();
    (teaTypes as any[]).forEach((tt: any) => {
      if (tt?._id && tt?.name)
        map.set(String(tt.name).toLowerCase(), String(tt._id));
    });
    return map;
  }, [teaTypes]);

  const getTeaTypeId = useCallback(
    (tea: any): string | null => {
      const t = tea?.type;
      if (!t) return null;

      if (typeof t === 'object') {
        const id = t?._id || t?.id;
        if (id) return String(id);

        const name = t?.name;
        if (typeof name === 'string') {
          return typeIdByNameLower.get(name.toLowerCase()) ?? null;
        }

        return null;
      }

      if (typeof t === 'string') {
        if (isObjectId(t)) return t;
        return typeIdByNameLower.get(t.toLowerCase()) ?? null;
      }

      return null;
    },
    [isObjectId, typeIdByNameLower]
  );

  const getTeaTypeName = useCallback(
    (tea: any): string => {
      const t = tea?.type;
      if (!t) return '';

      if (typeof t === 'object') {
        if (typeof t?.name === 'string') return String(t.name);

        const id = t?._id || t?.id;
        if (id) return typeNameById.get(String(id)) ?? '';

        return '';
      }

      if (typeof t === 'string') {
        if (isObjectId(t)) return typeNameById.get(t) ?? '';
        return t;
      }

      return '';
    },
    [isObjectId, typeNameById]
  );

  const myPostedTeas = useMemo(() => {
    if (!userId) return [];
    if (!Array.isArray(allTeas)) return [];

    return allTeas.filter((tea: any) => {
      const u = tea?.user;
      const id = typeof u === 'string' ? u : u?._id || u?.id;
      return id === userId;
    });
  }, [allTeas, userId]);

  const sourceList = postedOnly ? myPostedTeas : favorites;

  const filtered = useMemo(() => {
    if (!Array.isArray(sourceList)) return [];

    const needle = q.toLowerCase();

    return sourceList.filter((tea: any) => {
      const name = (tea.name ?? '').toLowerCase();
      const note = (tea.note ?? '').toLowerCase();
      const typeName = getTeaTypeName(tea).toLowerCase();
      const typeId = getTeaTypeId(tea);

      const matchesText =
        !needle ||
        name.includes(needle) ||
        note.includes(needle) ||
        typeName.includes(needle);

      const matchesType =
        !selectedTypeId || (typeId ? typeId === selectedTypeId : false);

      return matchesText && matchesType;
    });
  }, [sourceList, q, selectedTypeId, getTeaTypeId, getTeaTypeName]);

  const isLoading = favoritesLoading || teasLoading;

  const onRefresh = useCallback(() => {
    loadFavorites();
    mutateTeas();
  }, [loadFavorites, mutateTeas]);

  /**
   * STAGGER (runs every time you navigate to Library)
   */
  const anim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      // keep your existing behavior
      if (userId) {
        loadFavorites();
        mutateTeas();
      }

      // animate every focus
      anim.stopAnimation();
      anim.setValue(0);

      Animated.timing(anim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }).start();
    }, [userId, loadFavorites, mutateTeas, anim])
  );

  const itemStyleForIndex = useCallback(
    (index: number) => {
      const start = Math.min(0.85, index * 0.06);
      const inputRange = [start, Math.min(1, start + 0.25)];

      const opacity = anim.interpolate({
        inputRange,
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

      const translateY = anim.interpolate({
        inputRange,
        outputRange: [14, 0],
        extrapolate: 'clamp',
      });

      return {
        opacity,
        transform: [{ translateY }],
      };
    },
    [anim]
  );

  return (
    <ImageBackground
      source={require('../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover', opacity: 0.35 }}
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
        {/* Title + subtitle */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
          <Text
            style={[
              TYPO.display1,
              { color: COLORS.primaryDark, textTransform: 'uppercase' },
            ]}
          >
            Library
          </Text>

          <Text
            style={[
              TYPO.body ?? TYPO.cardSubtitle ?? TYPO.small,
              {
                color: COLORS.primaryDark,
                opacity: 0.7,
                textAlign: 'center',
                marginTop: 6,
                maxWidth: 320,
                lineHeight: 20,
              },
            ]}
          >
            Teas you saved for later.
          </Text>
        </View>

        {/* Search */}
        <View style={{ marginBottom: SPACING.md }}>
          <SearchBar
            value={q}
            onChangeText={setQ}
            onClear={() => setQ('')}
            placeholder={
              postedOnly
                ? 'Search in your posted teas'
                : 'Search in your saved teas'
            }
          />
        </View>

        {/* Chips */}
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
              active={!selectedTypeId}
              onPress={() => setSelectedTypeId(null)}
            />

            <Chip
              label="Posted"
              active={postedOnly}
              onPress={() => setPostedOnly(prev => !prev)}
            />

            {(teaTypes as any[]).map((type: any) => (
              <Chip
                key={type._id}
                label={type.name}
                active={selectedTypeId === String(type._id)}
                onPress={() =>
                  setSelectedTypeId(prev =>
                    prev === String(type._id) ? null : String(type._id)
                  )
                }
              />
            ))}
          </View>
        </ScrollView>

        {/* Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {filtered.map((tea: any, index: number) => {
            const isSaved = postedOnly ? savedIds.has(tea._id) : true;
            const typeName = getTeaTypeName(tea);

            return (
              <Animated.View
                key={tea._id}
                style={[
                  { width: '48%', marginBottom: 20 },
                  itemStyleForIndex(index),
                ]}
              >
                <TeaCard
                  name={tea.name}
                  typeName={typeName || undefined}
                  rating={tea.rating}
                  color={tea.color}
                  saved={isSaved}
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
          })}
        </View>

        {filtered.length === 0 && !isLoading && (
          <Text style={{ color: COLORS.primaryDark, marginTop: 20 }}>
            {postedOnly ? 'No posted teas found.' : 'No saved teas found.'}
          </Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

/**
 * AI-based code assistance was used during development
 * for guidance, explanation and debugging.
 */
