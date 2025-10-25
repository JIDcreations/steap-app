// app/(home)/index.tsx
import { useTeas } from '@/data/teas'; // adjust path if needed
import { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  // Fetch teas + expose mutate for manual refresh
  const { data: teas, error, isLoading, mutate } = useTeas();

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Early returns must come *after* hooks are defined
  if (isLoading) return <Text>Loading teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {teas && teas.length > 0 ? (
        teas.map((tea: any) => (
          <View
            key={tea._id}
            style={{
              marginBottom: 12,
              borderBottomWidth: 1,
              borderColor: '#ddd',
              paddingBottom: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{tea.name}</Text>
            <Text style={{ color: '#666' }}>
              {tea.type?.name || 'Unknown type'}
            </Text>
            {tea.note ? <Text style={{ color: '#999' }}>{tea.note}</Text> : null}
          </View>
        ))
      ) : (
        <View style={{ paddingTop: 24 }}>
          <Text>No teas found yet. Pull to refresh or try posting one!</Text>
        </View>
      )}
    </ScrollView>
  );
}
