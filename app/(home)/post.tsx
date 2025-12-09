// app/(home)/post.tsx

import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Chip from '../../components/Chip';
import FormField from '../../components/FormField';
import PostButton from '../../components/PostButton';
import useTeaPost from '../../data/tea-post';
import useTeaTypes from '../../data/tea-types';
import { COLORS, SPACING, TYPO } from '../theme';

const COLOR_SWATCHES = [
  '#b0a09bff',
  '#C2A98B',
  '#A88E85',
  '#8D7570',
  '#5E4F4D',
  '#243235',
  '#040403',
] as const;

const MOODS = ['calming', 'energizing', 'cozy', 'focus'] as const;

const SEED_USER_ID = '68deb78dd1fb610db1c307f8';

export default function PostTea() {
  const insets = useSafeAreaInsets();

  const [userId, setUserId] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<string | null>(null);
  const [steepTime, setSteepTime] = useState<string>('3');
  const [rating, setRating] = useState<string>('3');
  const [note, setNote] = useState<string>('');
  const [color, setColor] =
    useState<(typeof COLOR_SWATCHES)[number] | null>(COLOR_SWATCHES[1]);
  const [moodTag, setMoodTag] =
    useState<(typeof MOODS)[number] | null>('cozy');

  // Toast state
  const [successVisible, setSuccessVisible] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showSuccessToast = useCallback(
    (teaName?: string) => {
      setSuccessName(teaName ?? null);
      setSuccessVisible(true);
      toastAnim.setValue(0);

      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(toastAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSuccessVisible(false);
          });
        }, 1400);
      });
    },
    [toastAnim]
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('userId');
        if (!raw) {
          await AsyncStorage.setItem('userId', JSON.stringify(SEED_USER_ID));
          setUserId(SEED_USER_ID);
        } else {
          try {
            const parsed = JSON.parse(raw);
            setUserId(parsed?._id || parsed?.id || parsed || null);
          } catch {
            setUserId(raw);
          }
        }
      } catch (e) {
        console.warn('AsyncStorage error', e);
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  const {
    items: teaTypes,
    isLoading: typesLoading,
    error: typesError,
  } = useTeaTypes();

  useEffect(() => {
    if (!typesLoading && teaTypes?.length && !typeId) {
      setTypeId(teaTypes[0]._id);
    }
  }, [typesLoading, teaTypes, typeId]);

  const { trigger, isMutating, error } = useTeaPost();

  const canSubmit = useMemo(() => {
    if (!userId) return false;
    const n = name.trim().length > 0;
    const t = !!typeId;
    const st = Number(steepTime);
    const rt = Number(rating);
    const validSteep = Number.isFinite(st) && st > 0 && st < 60;
    const validRating = Number.isFinite(rt) && rt >= 1 && rt <= 5;
    const validColor = !color || COLOR_SWATCHES.includes(color);
    const validMood = !moodTag || MOODS.includes(moodTag as any);
    return (
      n &&
      t &&
      validSteep &&
      validRating &&
      validColor &&
      validMood &&
      !isMutating
    );
  }, [userId, name, typeId, steepTime, rating, color, moodTag, isMutating]);

  const onCreateTea = useCallback(async () => {
    const uid = userId ?? SEED_USER_ID;

    const st = Math.max(1, Math.min(59, Number(steepTime) || 0));
    const rt = Math.max(1, Math.min(5, Number(rating) || 0));

    try {
      const created = await trigger({
        name: name.trim(),
        type: typeId!,
        steepTime: st,
        rating: rt,
        note: note.trim() || undefined,
        color: color ?? undefined,
        moodTag: (moodTag as any) ?? undefined,
        user: uid,
      });

      // Form resetten
      setName('');
      setSteepTime('3');
      setRating('3');
      setNote('');

      // Styled toast tonen
      showSuccessToast(created?.name);
    } catch (e) {
      console.warn('Failed to create tea', e);
    }
  }, [
    trigger,
    userId,
    name,
    typeId,
    steepTime,
    rating,
    note,
    color,
    moodTag,
    showSuccessToast,
  ]);

  if (!booted) return <ThemedText>Loading user…</ThemedText>;

  const numericRating = Number(rating) || 0;

  // Toast animated styles
  const toastOpacity = toastAnim;
  const toastTranslateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <ImageBackground
      source={require('../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover', opacity: 0.35 }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: SPACING.xl * 2,
          }}
        >
          {/* Titel */}
          <View
            style={{ alignItems: 'center', marginBottom: SPACING.xl }}
          >
            <Text
              style={[
                TYPO.display1,
                {
                  color: COLORS.primaryDark,
                  textTransform: 'none',
                },
              ]}
            >
              Post Tea
            </Text>
          </View>

          {/* NAME */}
          <FormField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sencha, Chamomile,…"
          />

          {/* TYPE */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primaryDark,
                marginBottom: 6,
              }}
            >
              Type
            </Text>
            {typesLoading && (
              <Text style={{ color: COLORS.primaryDark }}>
                Loading types…
              </Text>
            )}
            {typesError && (
              <Text style={{ color: 'red' }}>
                Failed to load tea types
              </Text>
            )}
            {!typesLoading && !typesError && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <View style={{ flexDirection: 'row' }}>
                  {(teaTypes as any[]).map((t: any) => (
                    <Chip
                      key={t._id}
                      label={t.name}
                      active={t._id === typeId}
                      onPress={() => setTypeId(t._id)}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* STEAP TIME */}
          <FormField
            label="Steap Time (min)"
            value={steepTime}
            onChangeText={setSteepTime}
            placeholder="3"
            keyboardType="number-pad"
          />

          {/* RATING */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primaryDark,
                marginBottom: 6,
              }}
            >
              Rating
            </Text>
            <View style={{ flexDirection: 'row' }}>
              {[1, 2, 3, 4, 5].map(val => {
                const active = val <= numericRating;
                return (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setRating(String(val))}
                    style={{ marginRight: 8 }}
                  >
                    <Ionicons
                      name={active ? 'star' : 'star-outline'}
                      size={24}
                      color={
                        active
                          ? COLORS.primaryDark
                          : COLORS.accent
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* NOTE */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primaryDark,
                marginBottom: 6,
              }}
            >
              Note
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Short note"
              placeholderTextColor={COLORS.textSoft}
              multiline
              style={{
                borderWidth: 1,
                borderColor: COLORS.primaryDark,
                borderRadius: 8,
                paddingHorizontal: SPACING.md,
                backgroundColor: 'transparent',
                minHeight: 100,
                paddingVertical: 10,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* COLOR */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primaryDark,
                marginBottom: 6,
              }}
            >
              Color
            </Text>
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: 10 }}
              showsHorizontalScrollIndicator={false}
            >
              {COLOR_SWATCHES.map(c => {
                const active = c === color;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: c,
                      borderWidth: active ? 3 : 1,
                      borderColor: COLORS.primaryDark,
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* MOOD TAG */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primaryDark,
                marginBottom: 6,
              }}
            >
              Vibe
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={{ flexDirection: 'row' }}>
                {MOODS.map(m => {
                  const active = m === moodTag;
                  return (
                    <Chip
                      key={m}
                      label={
                        m.charAt(0).toUpperCase() + m.slice(1)
                      }
                      active={active}
                      onPress={() => setMoodTag(m)}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* SUBMIT */}
          <PostButton
            title="Post Tea"
            onPress={onCreateTea}
            disabled={!canSubmit}
            loading={isMutating}
          />

          {/* Error feedback */}
          {error ? (
            <ThemedText style={{ marginTop: 8, color: 'red' }}>
              {String(error)}
            </ThemedText>
          ) : null}
        </ScrollView>

        {/* SUCCESS TOAST */}
        {successVisible && (
          <Animated.View
            style={{
              position: 'absolute',
              left: SPACING.lg,
              right: SPACING.lg,
              bottom: insets.bottom + 24,
              paddingVertical: 12,
              paddingHorizontal: SPACING.md,
              borderRadius: 999,
              backgroundColor: COLORS.primaryDark,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={COLORS.primaryTextOnDark}
            />
            <Text
              style={{
                ...TYPO.body,
                color: COLORS.primaryTextOnDark,
                marginLeft: 8,
              }}
            >
              {successName
                ? `“${successName}” has been posted`
                : 'Tea posted'}
            </Text>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
}
