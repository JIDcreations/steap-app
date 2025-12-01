// components/TeaRowCard.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { COLORS, FONTS, SHADOWS, SPACING } from '../app/theme';

const FLOWER_IMG: ImageSourcePropType = require('../assets/images/FlowerPlant.png');

type Props = {
  name: string;
  typeName?: string;
  rating?: number;
  color?: string;
  saved?: boolean;
  onToggleSaved?: () => void;
};

export default function TeaRowCard({
  name,
  typeName,
  rating,
  color,
  saved = false,
  onToggleSaved,
}: Props) {
  const handlePress = () => {
    onToggleSaved?.();
  };

  // zelfde animatie-setup als TeaCard
  const rotation = useRef(new Animated.Value(saved ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(rotation, {
      toValue: saved ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [saved, rotation]);

  const rotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-8deg'],
        }),
      },
    ],
  };

  return (
    <View
      style={[
        styles.card,
        color ? { backgroundColor: color } : null,
      ]}
    >
      {/* Titel + mood links */}
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        <Text style={styles.mood} numberOfLines={1}>
          {typeName || 'Unknown type'}
        </Text>
      </View>

      {/* Rating rechtsboven */}
      <View style={styles.ratingRow}>
        <Ionicons
          name="star"
          size={16}
          color={COLORS.accentBadge}
          style={{ marginRight: 4 }}
        />
        <Text style={styles.ratingText}>
          {typeof rating === 'number' ? rating.toFixed(1) : '—'}
        </Text>
      </View>

      {/* Flower + plus button rechtsonder */}
      <Animated.Image source={FLOWER_IMG} style={[styles.flower, rotateStyle]} />

      <Pressable
        onPress={handlePress}
        hitSlop={10}
        style={[styles.addButton, saved && styles.addButtonSaved]}
      >
        <Ionicons
          name={saved ? 'checkmark' : 'add'}
          size={20}
          color={COLORS.primaryDark}
        />
      </Pressable>
    </View>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 132,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.teaCardDark,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.card,
  },

  textContainer: {
    flexShrink: 1,
    paddingRight: 80, // ruimte voor rating rechts
  },

  // zelfde look als vertical TeaCard titel
  name: {
    fontFamily: FONTS.heading, // PlayfairDisplay-Bold
    fontSize: 32,
    lineHeight: 34,
    color: COLORS.teaCardText,
    marginBottom: 4,
  },

  mood: {
    fontFamily: FONTS.bodyLight,
    fontSize: 14,
    color: COLORS.textMutedOnCard,
  },

  ratingRow: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.teaCardText,
  },

  flower: {
    position: 'absolute',
    right: -20,
    bottom: -25,
    width: 150,
    height: 130,
    resizeMode: 'contain',
    opacity: 0.95,
  },

  addButton: {
    position: 'absolute',
    right: 22,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentBadge,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  addButtonSaved: {
    backgroundColor: COLORS.accent,
  },
});
