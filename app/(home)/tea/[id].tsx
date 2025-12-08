// app/(home)/tea/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostButton from '../../../components/PostButton';
import { getCurrentUser } from '../../../data/auth';
import { getFavorites, toggleFavorite } from '../../../data/favorites';
import { COLORS, SPACING, TYPO } from '../../theme';

// Adjust only this to move blob up/down
const BLOB_TOP = -140;

export default function TeaDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tea, setTea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // load tea
  useEffect(() => {
    async function loadTea() {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/teas/${id}`
        );
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

  // load current user
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user?.id || user?._id) {
          setUserId(user.id || user._id);
        } else {
          setUserId(null);
        }
      } catch (e) {
        console.warn('Failed to load current user', e);
      }
    })();
  }, []);

  // sync isSaved met echte favorites wanneer user of tea verandert
  useEffect(() => {
    async function syncSaved() {
      if (!userId || !tea?._id) return;
      try {
        const favs = await getFavorites(userId);
        const exists = favs.some((t: any) => t._id === tea._id);
        setIsSaved(exists);
      } catch (e) {
        console.warn('Failed to load favorites for detail', e);
      }
    }
    syncSaved();
  }, [userId, tea?._id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.primaryDark }}>Loading…</Text>
      </View>
    );
  }

  if (!tea) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.primaryDark }}>Tea not found</Text>
      </View>
    );
  }

  const bgColor = tea.color || COLORS.primaryDark;
  const rating = Math.max(0, Math.min(5, Number(tea.rating) || 0));
  const bodyDynamicMarginTop = -BLOB_TOP + 10;

  async function handleAddToLibrary() {
    if (!userId || !tea?._id) return;

    try {
      setSaving(true);
      const res = await toggleFavorite(userId, tea._id);
      const favorites = (res.favorites as any[]) || [];
      const nowSaved = favorites.some((t: any) => t._id === tea._id);
      setIsSaved(nowSaved);
    } catch (e) {
      console.warn('Failed to toggle favorite from detail', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.2, resizeMode: 'cover' }}
    >
      <View style={{ flex: 1 }}>
        {/* HEADER (fixed) */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + SPACING.lg },
          ]}
        >
          {/* BLOB */}
          <View
            style={[
              styles.headerBlob,
              { backgroundColor: bgColor, top: BLOB_TOP },
            ]}
          />

          {/* BACK */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={24} color="#D6F4CD" />
          </Pressable>

          {/* TITLE + TAGS + STARS */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{tea.name || 'Unknown tea'}</Text>

            {/* CHIPS – 32px onder de titel */}
            <View style={styles.tagsRow}>
              {tea.moodTag ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{tea.moodTag}</Text>
                </View>
              ) : null}

              {tea.type?.name ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{tea.type.name}</Text>
                </View>
              ) : null}
            </View>

            {/* STARS */}
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < rating ? 'star' : 'star-outline'}
                  size={22}
                  color="#D6F4CD"
                  style={{ marginHorizontal: 2 }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* BODY – scrollable */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.body, { marginTop: bodyDynamicMarginTop }]}>
            {/* tijd boven de lijn */}
            <View style={styles.metaBlock}>
              <View style={styles.metaRowCentered}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={COLORS.primaryDark}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.metaText}>
                  {tea.steepTime ? `${tea.steepTime} min` : 'Brew time unknown'}
                </Text>
              </View>

              <View style={styles.metaLine} />
            </View>

            {/* description */}
            {tea.note ? (
              <Text style={styles.noteText}>{tea.note}</Text>
            ) : (
              <Text style={styles.noteText}>
                No description yet for this tea.
              </Text>
            )}

            {/* Add to library button (component) */}
            <PostButton
              title={isSaved ? 'In your library' : 'Add to library'}
              onPress={handleAddToLibrary}
              loading={saving}
              disabled={!userId}
            />
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

/* STYLES ------------------------------------------------------- */

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    justifyContent: 'flex-start',
    paddingBottom: SPACING.lg,
  },

  headerBlob: {
    position: 'absolute',
    alignSelf: 'center',
    width: '220%',
    height: 540,
    borderBottomLeftRadius: 540,
    borderBottomRightRadius: 540,
  },

  backButton: {
    marginBottom: SPACING.lg,
    zIndex: 1,
  },

  titleBlock: {
    alignItems: 'center',
    zIndex: 1,
  },

  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 52,
    color: '#D6F4CD',
    textAlign: 'center',
    marginBottom: 32,
    textTransform: 'lowercase',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: SPACING.md,
  },

  tag: {
    borderWidth: 1,
    borderColor: '#FDFBFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  tagText: {
    fontSize: 16,
    color: '#FDFBFC',
  },

  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },

  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  metaBlock: {
    marginBottom: SPACING.lg,
  },

  metaRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  metaText: {
    ...TYPO.body,
    color: COLORS.primaryDark,
  },

  metaLine: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.primaryDark,
  },

  noteText: {
    ...TYPO.body,
    color: COLORS.primaryDark,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
});
