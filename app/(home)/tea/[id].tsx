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
import { useToastPill } from '../../../components/ToastPill';
import { getCurrentUser } from '../../../data/auth';
import { getFavorites, toggleFavorite } from '../../../data/favorites';
import { useTea } from '../../../data/tea';
import { COLORS, SPACING, TYPO } from '../../theme';

// Adjust only this to move blob up/down
const BLOB_TOP = -200;

// ✅ NEW: keep spacing consistent no matter title wraps
const HEADER_HEIGHT = 430; // tweak if you want body closer/further (410–460 range)
const BODY_OFFSET_FROM_HEADER = -70; // your old sweet spot

export default function TeaDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const teaId = Array.isArray(id) ? id[0] : id;

  // ✅ tea via SWR hook (no fetch in screen)
  const { tea, isLoading: loading } = useTea(teaId);

  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // ✅ toast (same as post)
  const { show: showToast, Toast } = useToastPill({ COLORS, SPACING, TYPO });

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

  async function handleAddToLibrary() {
    if (!userId || !tea?._id) return;

    const wasSaved = isSaved;

    try {
      setSaving(true);
      const res = await toggleFavorite(userId, tea._id);
      const favorites = (res.favorites as any[]) || [];
      const nowSaved = favorites.some((t: any) => t._id === tea._id);
      setIsSaved(nowSaved);

      showToast({
        message: nowSaved ? 'Added to library' : 'Removed from library',
        icon: nowSaved ? 'checkmark-circle' : 'remove-circle',
      });
    } catch (e) {
      console.warn('Failed to toggle favorite from detail', e);

      showToast({
        message: 'Something went wrong',
        icon: 'alert-circle',
      });

      setIsSaved(wasSaved);
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
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + SPACING.lg },
          ]}
        >
          {/* HEADER (fixed height => consistent body spacing) */}
          <View style={styles.header}>
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
              <Text style={styles.title} numberOfLines={2}>
                {tea.name || 'Unknown tea'}
              </Text>

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

          {/* BODY */}
          <View style={[styles.body, { marginTop: BODY_OFFSET_FROM_HEADER }]}>
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

            {/* RECIPE */}
            {tea.recipe ? (
              <View style={styles.recipeBlock}>
                <Text style={styles.recipeTitle}>Recipe</Text>

                {Array.isArray(tea.recipe.ingredients) &&
                tea.recipe.ingredients.length > 0 ? (
                  <View style={styles.recipeRow}>
                    <Text style={styles.recipeLabel}>Ingredients</Text>
                    <Text style={styles.recipeValue}>
                      {tea.recipe.ingredients.join(', ')}
                    </Text>
                  </View>
                ) : null}

                {typeof tea.recipe.amount === 'string' &&
                tea.recipe.amount.trim().length > 0 ? (
                  <View style={styles.recipeRow}>
                    <Text style={styles.recipeLabel}>Amount</Text>
                    <Text style={styles.recipeValue}>{tea.recipe.amount}</Text>
                  </View>
                ) : null}

                {(typeof tea.recipe.waterMl === 'number' &&
                  Number.isFinite(tea.recipe.waterMl)) ||
                (typeof tea.recipe.tempC === 'number' &&
                  Number.isFinite(tea.recipe.tempC)) ? (
                  <View style={styles.recipeRow}>
                    <Text style={styles.recipeLabel}>Water</Text>
                    <Text style={styles.recipeValue}>
                      {typeof tea.recipe.waterMl === 'number'
                        ? `${tea.recipe.waterMl} ml`
                        : '—'}
                      {'  ·  '}
                      {typeof tea.recipe.tempC === 'number'
                        ? `${tea.recipe.tempC}°C`
                        : '—'}
                    </Text>
                  </View>
                ) : null}

                {typeof tea.recipe.steps === 'string' &&
                tea.recipe.steps.trim().length > 0 ? (
                  <View style={styles.recipeRow}>
                    <Text style={styles.recipeLabel}>Steps</Text>
                    <Text style={styles.recipeValue}>{tea.recipe.steps}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Add to library button */}
            <PostButton
              title={isSaved ? 'In your library' : 'Add to library'}
              onPress={handleAddToLibrary}
              loading={saving}
              disabled={!userId}
            />
          </View>
        </ScrollView>

        {/* Toast overlay */}
        <Toast bottom={insets.bottom + 18} />
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
    height: HEADER_HEIGHT, // ✅ fixed => consistent layout
    paddingHorizontal: SPACING.lg,
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
    marginBottom: 24, // was 32 (slightly tighter for 2 lines)
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
    marginBottom: SPACING.lg,
  },

  recipeBlock: {
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },

  recipeTitle: {
    ...TYPO.cardTitle,
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },

  recipeRow: {
    marginTop: SPACING.sm,
  },

  recipeLabel: {
    fontSize: 13,
    color: COLORS.primaryDark,
    opacity: 0.8,
    marginBottom: 4,
  },

  recipeValue: {
    ...TYPO.body,
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
});
