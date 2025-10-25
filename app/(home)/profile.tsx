// app/(home)/profile.tsx
import { useMyTeas } from '@/data/my-teas'; // or ../../data/my-teas
import { useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { data: myTeas, allTeas, error, isLoading, mutate, userId, setCurrentUserId } = useMyTeas();

  const onRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Build a small distinct user list from all teas (username + id)
  const distinctUsers = useMemo(() => {
    const map = new Map<string, { _id: string; username: string }>();
    for (const t of allTeas) {
      const u = t?.user;
      if (u?._id && !map.has(u._id)) {
        map.set(u._id, { _id: u._id, username: u.username ?? 'Unknown' });
      }
    }
    return Array.from(map.values());
  }, [allTeas]);

  if (isLoading) return <Text>Loading my teas...</Text>;
  if (error) return <Text selectable>{String(error)}</Text>;

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>My Teas</Text>
      <Text style={{ color: '#666', marginBottom: 16 }}>
        Current userId: <Text style={{ fontWeight: '700' }}>{userId ?? '—'}</Text>
      </Text>

      {/* If empty, offer a quick “Set as me” chooser from detected users */}
      {myTeas.length === 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>
            No teas found for your current user. Pick your user:
          </Text>
          {distinctUsers.map((u) => (
            <Pressable
              key={u._id}
              onPress={() => setCurrentUserId(u._id)}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderColor: '#eee'
              }}
            >
              <Text>
                {u.username} — <Text style={{ color: '#666' }}>{u._id}</Text>
              </Text>
            </Pressable>
          ))}
          {distinctUsers.length === 0 && (
            <Text style={{ color: '#666' }}>
              No users found in teas. Create a post first.
            </Text>
          )}
        </View>
      )}

      {myTeas.length > 0 ? (
        myTeas.map((tea: any) => (
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
      ) : null}
    </ScrollView>
  );
}
