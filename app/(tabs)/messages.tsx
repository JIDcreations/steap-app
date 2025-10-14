import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import useSWR from 'swr'

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? ''

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json()
}

export default function MessagesScreen() {
  const { data, error, isLoading } = useSWR(`${API_BASE}/messages`, fetcher)
  const tint = useThemeColor({}, 'tint')

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading messages…</ThemedText>
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle">Error loading messages</ThemedText>
        <ThemedText>{String(error)}</ThemedText>
      </ThemedView>
    )
  }

  const messages: any[] = Array.isArray(data) ? data : data?.messages ?? []

  const renderItem = ({ item }: { item: any }) => {
    const title = item?.title ?? item?.subject ?? item?.from ?? 'Message'
    // prefer obvious text fields
    const bodyRaw = item?.body ?? item?.message ?? item?.text ?? item?.content ?? item?.payload
    let bodyText = ''
    if (typeof bodyRaw === 'string') bodyText = bodyRaw
    else if (typeof item === 'string') bodyText = item
    else if (typeof item === 'object' && item !== null) {
      for (const v of Object.values(item)) {
        if (typeof v === 'string') {
          bodyText = v
          break
        }
      }
    }

    return (
      <View style={styles.itemContainer}>
        <ThemedView lightColor="#F3F7FA" darkColor="#1B1D1E" style={styles.bubble}>
          <ThemedText type="subtitle" style={[styles.title, { color: tint }]}>
            {title}
          </ThemedText>
          <ThemedText style={styles.body}>{bodyText}</ThemedText>
        </ThemedView>
      </View>
    )
  }

  return (
    <ThemedView style={styles.wrapper}>
      <FlatList
        contentContainerStyle={styles.container}
        data={messages}
        keyExtractor={(item, idx) => item?.id?.toString?.() ?? String(idx)}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <ThemedView style={styles.center}>
            <ThemedText>No messages found.</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemContainer: { marginBottom: 10 },
  bubble: { padding: 12, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  title: { marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 20 },
})
