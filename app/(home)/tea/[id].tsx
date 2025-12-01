// app/(home)/tea/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, Text } from 'react-native';
import { COLORS, SPACING, TYPO } from '../../theme';

export default function TeaDetailScreen() {
  const { id } = useLocalSearchParams();        // /tea/123
  const [tea, setTea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTea() {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/teas/${id}`);
        const data = await res.json();
        setTea(data);
      } catch (e) {
        console.warn('Failed to load tea', e);
      } finally {
        setLoading(false);
      }
    }
    loadTea();
  }, [id]);

  if (loading) return <Text style={{ padding: 20 }}>Loading…</Text>;
  if (!tea) return <Text style={{ padding: 20 }}>Tea not found</Text>;

  return (
    <ImageBackground
      source={require('../../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.45 }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: SPACING.lg,
          paddingBottom: SPACING.xl,
        }}
      >
        {/* Titel */}
        <Text
          style={[
            TYPO.display1,
            { color: COLORS.primaryDark, marginBottom: SPACING.md },
          ]}
        >
          {tea.name}
        </Text>

        {/* Type */}
        <Text
          style={{
            fontSize: 16,
            color: COLORS.primaryDark,
            marginBottom: 12,
          }}
        >
          {tea.type?.name || 'Unknown type'}
        </Text>

        {/* Rating */}
        <Text
          style={{
            fontSize: 16,
            color: COLORS.primaryDark,
            marginBottom: 12,
          }}
        >
          Rating: {tea.rating}
        </Text>

        {/* Note */}
        {tea.note ? (
          <Text style={{ fontSize: 15, color: COLORS.primaryDark }}>
            {tea.note}
          </Text>
        ) : null}
      </ScrollView>
    </ImageBackground>
  );
}
