// app/(home)/post.tsx

import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Chip from '../../components/Chip';
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

const INPUT_HEIGHT = 50;

const inputBaseStyle = {
  borderWidth: 1,
  borderColor: COLORS.primaryDark,
  borderRadius: 8,
  paddingHorizontal: SPACING.md,
  height: INPUT_HEIGHT,
  backgroundColor: 'transparent' as const,
};

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
  const [isPublic, setIsPublic] = useState(true);

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

  const { trigger, isMutating, error, data } = useTeaPost();

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

    await trigger({
      name: name.trim(),
      type: typeId!,
      steepTime: st,
      rating: rt,
      note: note.trim() || undefined,
      color: color ?? undefined,
      moodTag: (moodTag as any) ?? undefined,
      public: isPublic,
      user: uid,
    });

    setName('');
    setSteepTime('3');
    setRating('3');
    setNote('');
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
    isPublic,
  ]);

  if (!booted) return <ThemedText>Loading user…</ThemedText>;

  const numericRating = Number(rating) || 0;

  return (
    <ImageBackground
      source={require('../../assets/images/HomeBG.png')}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover', opacity: 0.35 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.xl,
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
        <View style={{ marginBottom: SPACING.md }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.primaryDark,
              marginBottom: 6,
            }}
          >
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sencha, Chamomile,…"
            placeholderTextColor={COLORS.textSoft}
            style={inputBaseStyle}
          />
        </View>

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

        {/* STEEP TIME */}
        <View style={{ marginBottom: SPACING.md }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.primaryDark,
              marginBottom: 6,
            }}
          >
            Steap Time (min)
          </Text>
          <TextInput
            value={steepTime}
            onChangeText={setSteepTime}
            placeholder="3"
            placeholderTextColor={COLORS.textSoft}
            keyboardType="number-pad"
            style={inputBaseStyle}
          />
        </View>

        {/* RATING – sterren */}
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
              ...inputBaseStyle,
              height: undefined,
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

        {/* MOOD / VIBE */}
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

        {/* PUBLIC */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.lg,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.primaryDark,
              marginRight: 8,
            }}
          >
            Public
          </Text>
          <Switch value={isPublic} onValueChange={setIsPublic} />
        </View>

        {/* SUBMIT */}
        <Pressable
          onPress={onCreateTea}
          disabled={!canSubmit}
          style={{
            backgroundColor: canSubmit
              ? COLORS.primaryDark
              : COLORS.backgroundAlt,
            paddingVertical: 14,
            borderRadius: 999,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: COLORS.primaryTextOnDark,
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            {isMutating ? 'Creating…' : 'Post Tea'}
          </Text>
        </Pressable>

        {/* FEEDBACK */}
        {error ? (
          <ThemedText style={{ marginTop: 8, color: 'red' }}>
            {String(error)}
          </ThemedText>
        ) : null}
        {data ? (
          <ThemedText style={{ marginTop: 8 }}>
            Created: {data?.name} (id: {data?._id})
          </ThemedText>
        ) : null}
      </ScrollView>
    </ImageBackground>
  );
}
