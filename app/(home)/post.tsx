// app/(home)/post.tsx
import { ThemedText } from "@/components/themed-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ScrollView, Switch, TextInput, TouchableOpacity, View } from "react-native";
import useTeaPost from "../../data/tea-post"; // uses SWR mutation
import useTeaTypes from "../../data/tea-types";

// ✅ enums from your backend model
const COLOR_SWATCHES = ['#b0a09bff', '#C2A98B', '#A88E85', '#8D7570', '#5E4F4D','#243235','#040403',] as const;
const MOODS = ['calming', 'energizing', 'cozy', 'focus'] as const;

// fallback user id (must exist in DB)
const SEED_USER_ID = "68deb78dd1fb610db1c307f8";

export default function PostTea() {
  const [userId, setUserId] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [steepTime, setSteepTime] = useState<string>("3");  // minutes (string for TextInput)
  const [rating, setRating] = useState<string>("5");        // 1..5 (string for TextInput)
  const [note, setNote] = useState<string>("");
  const [color, setColor] = useState<typeof COLOR_SWATCHES[number] | null>(COLOR_SWATCHES[1]);
  const [moodTag, setMoodTag] = useState<typeof MOODS[number] | null>("cozy");
  const [isPublic, setIsPublic] = useState(true);

  // load/seed user once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("userId");
        if (!raw) {
          await AsyncStorage.setItem("userId", JSON.stringify(SEED_USER_ID));
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
        console.warn("AsyncStorage error", e);
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  // Load tea types for selector
  const { items: teaTypes, isLoading: typesLoading, error: typesError } = useTeaTypes();

  // pick first type by default when loaded
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
    return n && t && validSteep && validRating && validColor && validMood && !isMutating;
  }, [userId, name, typeId, steepTime, rating, color, moodTag, isMutating]);

  const onCreateTea = useCallback(async () => {
    const uid = userId ?? SEED_USER_ID;

    // clamp + coerce
    const st = Math.max(1, Math.min(59, Number(steepTime) || 0));
    const rt = Math.max(1, Math.min(5, Number(rating) || 0));

    await trigger({
      name: name.trim(),
      type: typeId!,                 // TeaType _id
      steepTime: st,
      rating: rt,
      note: note.trim() || undefined,
      color: color ?? undefined,
      moodTag: (moodTag as any) ?? undefined,
      public: isPublic,
      user: uid,
    });

    // Reset minimal fields after success (keep type/mood/color as last selections)
    setName("");
    setSteepTime("3");
    setRating("5");
    setNote("");
  }, [trigger, userId, name, typeId, steepTime, rating, note, color, moodTag, isPublic]);

  if (!booted) return <ThemedText>Loading user…</ThemedText>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
      <ThemedText style={{ fontSize: 18, marginBottom: 4 }}>Post a new tea</ThemedText>

      {/* NAME */}
      <View style={{ gap: 6 }}>
        <ThemedText>Name</ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sencha, Chamomile"
          style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        />
      </View>

      {/* TYPE */}
      <View style={{ gap: 6 }}>
        <ThemedText>Type</ThemedText>
        {typesLoading && <ThemedText>Loading types…</ThemedText>}
        {typesError && <ThemedText>Failed to load tea types</ThemedText>}
        {!typesLoading && !typesError && (
          <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
            {teaTypes.map((t) => {
              const active = t._id === typeId;
              return (
                <TouchableOpacity
                  key={t._id}
                  onPress={() => setTypeId(t._id)}
                  style={{
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  <ThemedText>{t.name}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* STEEP TIME */}
      <View style={{ gap: 6 }}>
        <ThemedText>Steep time (min)</ThemedText>
        <TextInput
          value={steepTime}
          onChangeText={setSteepTime}
          placeholder="3"
          keyboardType="number-pad"
          style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        />
      </View>

      {/* RATING */}
      <View style={{ gap: 6 }}>
        <ThemedText>Rating (1–5)</ThemedText>
        <TextInput
          value={rating}
          onChangeText={setRating}
          placeholder="5"
          keyboardType="number-pad"
          style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        />
      </View>

      {/* NOTE */}
      <View style={{ gap: 6 }}>
        <ThemedText>Note</ThemedText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Short note (optional)"
          multiline
          style={{ borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 80 }}
        />
      </View>

      {/* COLOR */}
      <View style={{ gap: 6 }}>
        <ThemedText>Color</ThemedText>
        <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>
          {COLOR_SWATCHES.map((c) => {
            const active = c === color;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: c,
                  borderWidth: active ? 2 : 1,
                }}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* MOOD TAG */}
      <View style={{ gap: 6 }}>
        <ThemedText>Mood</ThemedText>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {MOODS.map((m) => {
            const active = m === moodTag;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setMoodTag(m)}
                style={{
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  opacity: active ? 1 : 0.6,
                }}
              >
                <ThemedText>{m}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* PUBLIC */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ThemedText>Public</ThemedText>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      {/* SUBMIT */}
      <Button
        title={isMutating ? "Creating…" : "Create Tea"}
        onPress={onCreateTea}
        disabled={!canSubmit}
      />

      {/* FEEDBACK */}
      {error ? <ThemedText>❌ {String(error)}</ThemedText> : null}
      {data ? (
        <ThemedText>✅ Created: {data?.name} (id: {data?._id})</ThemedText>
      ) : null}
    </ScrollView>
  );
}
