// app/(home)/index.tsx
import { useSavedTeas } from '@/data/saved-teas';
import useTeaTypes from '@/data/tea-types';
import { useTeas } from '@/data/teas';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { data: teas, error, isLoading, mutate } = useTeas();
  const { isSaved, toggleSaved, refresh } = useSavedTeas();

  // ✅ dynamic tea types
  const { items: teaTypes, isLoading: loadingTypes } = useTeaTypes();

  const [q, setQ] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    mutate();
    refresh();
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

      {/* ✅ Dynamic type filter chips */}
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

              {/* Save / Unsave */}
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
