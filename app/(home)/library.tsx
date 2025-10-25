// app/(home)/library.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
// adjust path if no '@' alias → ../../data/saved-teas
import { useSavedTeas } from '@/data/saved-teas';

export default function LibraryScreen() {
  const { savedTeas, isLoading, error, refresh, reloadSaved, toggleSaved } = useSavedTeas();

  const onRefresh = useCallback(() => {
    refresh(); // reload saved ids + refetch teas
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      reloadSaved();
    }, [reloadSaved])
  );

  if (isLoading) return <Text>Loading library...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
        Saved Teas {savedTeas.length ? `(${savedTeas.length})` : ''}
      </Text>

      {savedTeas.length > 0 ? (
        savedTeas.map((tea: any) => (
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
              <Text style={{ color: '#666' }}>{tea.type?.name || 'Unknown type'}</Text>
              {tea.note ? <Text style={{ color: '#999' }}>{tea.note}</Text> : null}
            </View>

            {/* Unsave button */}
            <Pressable
              onPress={() => toggleSaved(tea._id)}
              hitSlop={8}
              style={{ padding: 6 }}
              accessibilityLabel="Unsave tea"
            >
              <Ionicons name="trash-outline" size={22} />
            </Pressable>
          </View>
        ))
      ) : (
        <Text style={{ color: '#666' }}>
          You haven’t saved any teas yet. Go to Home and tap the “+” icon.
        </Text>
      )}
    </ScrollView>
  );
}
