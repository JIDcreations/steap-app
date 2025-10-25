// app/(home)/index.tsx
import { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
// If you don't use '@' alias, change to: ../../data/teas
import { useTeas } from '@/data/teas';

export default function HomeScreen() {
  // Fetch teas + expose mutate for manual refresh
  const { data: teas, error, isLoading, mutate } = useTeas();

  // Loading / error states
  if (isLoading) return <Text>Loading teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    // Triggers SWR revalidation (re-fetch)
    mutate();
  }, [mutate]);

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
