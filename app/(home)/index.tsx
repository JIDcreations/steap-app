// app/(home)/index.tsx
import useTeaTypes from '@/data/tea-types';
import { useTeas } from '@/data/teas';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

// NEW: backend favorites helpers
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavorites, toggleFavorite } from '../../data/favorites';

export default function HomeScreen() {
  const { data: teas, error, isLoading, mutate } = useTeas();

  // ✅ dynamic tea types
  const { items: teaTypes, isLoading: loadingTypes } = useTeaTypes();

  // --- NEW: backend-powered "saved" state ----
  const [userId, setUserId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // load userId once
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    })();
  }, []);

  // fetch favorites from backend
  const loadFavorites = useCallback(async () => {
    if (!userId) return;
    const favs = await getFavorites(userId); // populated tea objects
    const ids = new Set<string>(favs.map((t: any) => t._id));
    setSavedIds(ids);
  }, [userId]);

  // initial favorites load when userId is ready
  useEffect(() => {
    if (userId) loadFavorites();
  }, [userId, loadFavorites]);

  // helpers to mirror your old hook API
  const isSaved = useCallback((teaId: string) => savedIds.has(teaId), [savedIds]);

  const toggleSaved = useCallback(
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
        // sync to server truth
        const ids = new Set<string>((res.favorites as any[]).map((t: any) => t._id));
        setSavedIds(ids);
      } catch {
        // revert on error
        await loadFavorites();
      }
    },
    [userId, loadFavorites]
  );

  const refresh = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);
  // --- END new saved logic ----

  const [q, setQ] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    mutate();     // refresh teas
    refresh();    // refresh favorites from backend
  }, [mutate, refresh]);

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
    <ScrollView
      style={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      {/* Search bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginBottom: 12,
          gap: 8,
        }}
      >
        <Ionicons name="search-outline" size={18} />
        <TextInput
          placeholder="Search name, note, type, user…"
          value={q}
          onChangeText={setQ}
          style={{ flex: 1 }}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={8} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={18} />
          </Pressable>
        ) : null}
      </View>

      {/* Dynamic type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {loadingTypes && (
          <View style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#f2f2f2', borderRadius: 20, marginRight: 8 }}>
            <Text style={{ color: '#666' }}>Loading types…</Text>
          </View>
        )}

        {teaTypes.map((type) => {
          const active = selectedType === type.name;
          return (
            <Pressable
              key={type._id}
              onPress={() => setSelectedType(active ? null : type.name)}
              style={{
                backgroundColor: active ? '#333' : '#f2f2f2',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                marginRight: 8,
              }}
            >
              <Text style={{ color: active ? '#fff' : '#333', fontWeight: '600' }}>
                {type.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Teas list */}
      {filtered && filtered.length > 0 ? (
        filtered.map((tea: any) => {
          const saved = isSaved(tea._id);
          return (
            <View
              key={tea._id}
              style={{
                marginBottom: 12,
                borderBottomWidth: 1,
                borderColor: '#ddd',
                paddingBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '600' }}>{tea.name}</Text>
                <Text style={{ color: '#666' }}>
                  {tea.type?.name || 'Unknown type'} • {tea.user?.username ?? '—'}
                </Text>
                {tea.note ? <Text style={{ color: '#999' }}>{tea.note}</Text> : null}
              </View>

              {/* Save / Unsave (now hits backend) */}
              <Pressable onPress={() => toggleSaved(tea._id)} hitSlop={8} style={{ padding: 6 }}>
                <Ionicons name={saved ? 'checkmark-circle' : 'add-circle-outline'} size={24} />
              </Pressable>
            </View>
          );
        })
      ) : (
        <View style={{ paddingTop: 24 }}>
          <Text>No teas match your filters.</Text>
        </View>
      )}
    </ScrollView>
  );
}
