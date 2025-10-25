// app/(home)/index.tsx
import { ScrollView, Text, View } from 'react-native';
// ⬇️ adjust if you don’t use @ alias
import { useTeas } from '@/data/teas';

export default function HomeScreen() {
  // Fetch teas from backend
  const { data: teas, error, isLoading } = useTeas();

  // Loading / error states
  if (isLoading) return <Text>Loading teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  const isArray = Array.isArray(teas);

  return (
    <ScrollView style={{ padding: 16 }}>
      {!isArray ? (
        // Debug view: show what we actually got from the backend
        <View>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>
            Unexpected payload (not an array)
          </Text>
          <Text selectable style={{ fontFamily: 'monospace' }}>
            {JSON.stringify(teas, null, 2)}
          </Text>
        </View>
      ) : (
        <>
          {teas.map((tea: any) => (
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
              {tea.note ? (
                <Text style={{ color: '#999' }}>{tea.note}</Text>
              ) : null}
            </View>
          ))}

          {teas.length === 0 && (
            <View style={{ paddingTop: 24 }}>
              <Text>No teas found yet. Try posting one!</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
