// app/(home)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
// If you don't use '@' alias, change both imports to ../../data/...
import { useSavedTeas } from '@/data/saved-teas';
import { useTeas } from '@/data/teas';

export default function HomeScreen() {
  // All teas
  const { data: teas, error, isLoading, mutate } = useTeas();

  // Saved-teas state (local AsyncStorage)
  const { isSaved, toggleSaved, refresh } = useSavedTeas();

  // Pull-to-refresh → refetch from server
  const onRefresh = useCallback(() => {
    mutate();
    refresh();
  }, [mutate, refresh]);

  if (isLoading) return <Text>Loading teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      {teas && teas.length > 0 ? (
        teas.map((tea: any) => {
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
                <Text style={{ color: '#666' }}>{tea.type?.name || 'Unknown type'}</Text>
                {tea.note ? <Text style={{ color: '#999' }}>{tea.note}</Text> : null}
              </View>

              {/* Save / Unsave button */}
              <Pressable
                onPress={() => toggleSaved(tea._id)}
                hitSlop={8}
                style={{ padding: 6 }}
              >
                <Ionicons
                  name={saved ? 'checkmark-circle' : 'add-circle-outline'}
                  size={24}
                />
              </Pressable>
            </View>
          );
        })
      ) : (
        <View style={{ paddingTop: 24 }}>
          <Text>No teas found yet. Pull to refresh or try posting one!</Text>
        </View>
      )}
    </ScrollView>
  );
}
