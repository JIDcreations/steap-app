// components/TeaCard.tsx

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

const LEAF_IMG: ImageSourcePropType = require('../assets/images/Leaf1.png');

type Props = {
  name: string;
  typeName?: string;   // mood label ("Calming Green")
  rating?: number;
  saved?: boolean;
  onToggleSaved?: () => void;
};

export default function TeaCard({
  name,
  typeName,
  rating,
  saved = false,
  onToggleSaved,
}: Props) {
  // Animated value for leaf rotation (0 = normaal, 1 = licht naar links)
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

  const handlePress = () => {
    onToggleSaved?.();
  };

  return (
    <View style={styles.card}>
      {/* Tekstblok */}
      <View style={styles.textContainer}>
        {/* Thee naam */}
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        {/* Mood label */}
        <Text style={styles.mood} numberOfLines={1}>
          {typeName || 'Unknown type'}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons
            name="star"
            size={14}
            color={COLORS.accentBadge}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.ratingText}>
            {typeof rating === 'number' ? rating.toFixed(1) : '—'}
          </Text>
        </View>
      </View>

      {/* Leaf illustratie met animatie */}
      <Animated.Image source={LEAF_IMG} style={[styles.leaf, rotateStyle]} />

      {/* Plus / saved button */}
      <Pressable
        onPress={handlePress}
        hitSlop={10}
        style={[styles.addButton, saved && styles.addButtonSaved]}
      >
        <Ionicons
          name={saved ? 'checkmark' : 'add'}
          size={22}
          color={COLORS.primaryDark}
        />
      </Pressable>
    </View>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  card: {
    width: 165,
    height: 205,
    backgroundColor: COLORS.teaCardDark,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    marginRight: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.card,
  },

  textContainer: {
    zIndex: 2,
  },

  name: {
    fontFamily: FONTS.heading,   // PlayfairDisplay-Bold
    fontSize: 32,
    lineHeight: 34,
    color: COLORS.teaCardText,
    marginBottom: 4,
  },

  mood: {
    fontFamily: FONTS.bodyLight,
    fontSize: 14,
    color: COLORS.textMutedOnCard,
    marginBottom: 10,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.teaCardText,
  },

  leaf: {
    position: 'absolute',
    right: -4,
    bottom: -7,
    width: 90,
    height: 90,
    resizeMode: 'contain',
    opacity: 0.95,
  },

  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentBadge,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },

  addButtonSaved: {
    backgroundColor: COLORS.accent,
  },
});
