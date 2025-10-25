// app/(home)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
// adjust paths if you don’t use '@'
import { useSavedTeas } from '@/data/saved-teas';
import { useTeas } from '@/data/teas';

export default function HomeScreen() {
  const { data: teas, error, isLoading, mutate } = useTeas();
  const { isSaved, toggleSaved, refresh } = useSavedTeas();

  const [q, setQ] = useState('');

  const onRefresh = useCallback(() => {
    mutate();
    refresh();
  }, [mutate, refresh]);

  const filtered = useMemo(() => {
    if (!Array.isArray(teas)) return [];
    if (!q.trim()) return teas;
    const needle = q.toLowerCase();
    return teas.filter((t: any) => {
      const name = (t.name ?? '').toLowerCase();
      const note = (t.note ?? '').toLowerCase();
      const type = (t.type?.name ?? '').toLowerCase();
      const user = (t.user?.username ?? '').toLowerCase();
      return (
        name.includes(needle) ||
        note.includes(needle) ||
        type.includes(needle) ||
        user.includes(needle)
      );
    });
  }, [teas, q]);

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
          <Text>No teas match your search.</Text>
        </View>
      )}
    </ScrollView>
  );
}
