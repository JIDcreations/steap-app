// app/(home)/library.tsx
import { useSavedTeas } from '@/data/saved-teas'; // or ../../data/saved-teas
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

export default function LibraryScreen() {
  const { savedTeas, isLoading, error, refresh, reloadSaved } = useSavedTeas();

  const onRefresh = useCallback(() => {
    refresh(); // reload saved IDs + refetch teas
  }, [refresh]);

  // When the Library tab gains focus, reload saved IDs
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
        Saved Teas
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
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{tea.name}</Text>
            <Text style={{ color: '#666' }}>{tea.type?.name || 'Unknown type'}</Text>
            {tea.note ? <Text style={{ color: '#999' }}>{tea.note}</Text> : null}
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
