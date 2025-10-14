import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Home icon – change the name to try variants: leaf-outline, flame-outline, compass-outline */}
      <Ionicons name="leaf-outline" size={48} />
      <Ionicons name="leaf-outline" size={64} color="#7BC96F" />
      <ThemedText type="title">Welcome to STEAP</ThemedText>
      <ThemedText style={styles.subtitle}>
        Track your teas and explore new flavors.
      </ThemedText>

      <Link href="/messages" style={styles.cta}>
        <ThemedText type="link">Go to messages</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  cta: {
    marginTop: 8,
  },
});
