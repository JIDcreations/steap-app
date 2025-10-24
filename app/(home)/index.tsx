// app/(home)/index.tsx
import { ThemedText } from "@/components/themed-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import { Button, View } from "react-native";
import useTeaPost from "../../data/tea-post"; // adjust path if needed

// 👉 use a real TeaType _id from your DB
const TEA_TYPE_ID = "68e55313b3634091363c3a5e";
// 👉 your test user id (existing in DB)
const SEED_USER_ID = "68deb78dd1fb610db1c307f8";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  // Seed / load user once (prof’s pattern)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("userId");
        if (!raw) {
          // seed a known user id so Home can render immediately
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

  const { trigger, isMutating, error, data } = useTeaPost();

  const onCreateTea = useCallback(async () => {
    const uid = userId ?? SEED_USER_ID; // fallback just in case
    await trigger({
      name: "Oolong from App",
      type: TEA_TYPE_ID,
      steepTime: 4,
      rating: 5,
      note: "Created via Expo mutation",
      color: "#A88E85",
      moodTag: "cozy",
      public: true,
      user: uid,
    });
  }, [trigger, userId]);

  // Minimal boot/loading state
  if (!booted) return <ThemedText>Loading user…</ThemedText>;

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <ThemedText>user: {userId}</ThemedText>

      <Button
        title={isMutating ? "Creating…" : "Create Tea"}
        onPress={onCreateTea}
        disabled={isMutating}
      />

      {error ? <ThemedText>❌ {String(error)}</ThemedText> : null}
      {data ? (
        <ThemedText>✅ Created: {data?.name} (id: {data?._id})</ThemedText>
      ) : null}
    </View>
  );
}
