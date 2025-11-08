// app/(home)/library.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { getFavorites, toggleFavorite } from '../../data/favorites';

type Tea = {
  _id: string;
  name: string;
  type?: { name?: string };
  note?: string;
};

export default function LibraryScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [savedTeas, setSavedTeas] = useState<Tea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load user id once
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    })();
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const favs = await getFavorites(userId); // populated teas
      setSavedTeas(favs as Tea[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Refresh control
  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const favs = await getFavorites(userId);
      setSavedTeas(favs as Tea[]);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  // Reload whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  // Initial load after userId resolves
  useEffect(() => {
    if (userId) loadFavorites();
  }, [userId, loadFavorites]);

  // Toggle remove (trash icon)
  const onUnsave = useCallback(
    async (teaId: string) => {
      if (!userId) return;
      // optimistic update
      const prev = savedTeas;
      setSavedTeas((cur) => cur.filter((t) => t._id !== teaId));
      try {
        const res = await toggleFavorite(userId, teaId); // server returns full favorites list
        setSavedTeas(res.favorites as Tea[]);
      } catch {
        // revert on failure
        setSavedTeas(prev);
      }
    },
    [userId, savedTeas]
  );

  if (!userId) return <Text style={{ padding: 16 }}>No user session found.</Text>;
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) return <Text style={{ padding: 16 }} selectable>{error}</Text>;

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
        Saved Teas {savedTeas.length ? `(${savedTeas.length})` : ''}
      </Text>

      {savedTeas.length > 0 ? (
        savedTeas.map((tea) => (
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

            <Pressable
              onPress={() => onUnsave(tea._id)}
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
          You haven’t saved any teas yet. Go to Home and tap the “Add to Library” button.
        </Text>
      )}
    </ScrollView>
  );
}
