// app/(home)/library.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { getCurrentUser } from '../../data/auth';
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

  // Haal de ingelogde user op uit auth (steap:user)
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user?.id || user?._id) {
        setUserId(user.id || user._id);
      } else {
        setUserId(null);
      }
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

  // Elke keer dat het scherm focus krijgt → reload
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  // Eerste load wanneer userId bekend is
  useEffect(() => {
    if (userId) {
      loadFavorites();
    }
  }, [userId, loadFavorites]);

  const onUnsave = useCallback(
    async (teaId: string) => {
      if (!userId) return;
      const prev = savedTeas;
      setSavedTeas((cur) => cur.filter((t) => t._id !== teaId));
      try {
        const res = await toggleFavorite(userId, teaId); // server returns full favorites list
        setSavedTeas(res.favorites as Tea[]);
      } catch {
        setSavedTeas(prev);
      }
    },
    [userId, savedTeas]
  );

  if (!userId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>No user session found.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <Text style={{ padding: 16 }} selectable>
        {error}
      </Text>
    );
  }

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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
              <Text style={{ color: '#666' }}>
                {tea.type?.name || 'Unknown type'}
              </Text>
              {tea.note ? (
                <Text style={{ color: '#999' }}>{tea.note}</Text>
              ) : null}
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
