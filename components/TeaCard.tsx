import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
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
  typeName?: string;
  rating?: number;
  color?: string;
  saved?: boolean;
  onToggleSaved?: () => void;
  onPressCard?: () => void;
};

export default function TeaCard({
  name,
  typeName,
  rating,
  color,
  saved = false,
  onToggleSaved,
  onPressCard,
}: Props) {
  // Card press animation (smooth spring)
  const cardPress = useRef(new Animated.Value(0)).current; // 0..1

  const onPressIn = () => {
    Animated.spring(cardPress, {
      toValue: 1,
      friction: 7,
      tension: 170,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(cardPress, {
      toValue: 0,
      friction: 7,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  const cardTransform = useMemo(
    () => ({
      transform: [
        {
          scale: cardPress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.985],
          }),
        },
        {
          translateY: cardPress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ],
    }),
    [cardPress]
  );

  // Rotatie van de leaf illustratie
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
      {
        // subtle "follow" on press
        translateY: cardPress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1.5],
        }),
      },
      {
        scale: cardPress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.985],
        }),
      },
    ],
  };

  // Pop-animatie voor het plus/check icoon (smoother spring)
  const iconPop = useRef(new Animated.Value(0)).current; // 0..1

  const animatePop = () => {
    iconPop.setValue(0);
    Animated.sequence([
      Animated.spring(iconPop, {
        toValue: 1,
        friction: 5,
        tension: 220,
        useNativeDriver: true,
      }),
      Animated.timing(iconPop, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // extra micro pulse when saved changes (feel)
  useEffect(() => {
    if (saved) animatePop();
    // also pulse when unsaving (subtle)
    if (!saved) animatePop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  const handlePressSaved = (event: GestureResponderEvent) => {
    event.stopPropagation(); // voorkom dat card geopend wordt
    animatePop();
    onToggleSaved?.();
  };

  const iconScale = iconPop.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });

  return (
    <Pressable
      onPress={onPressCard}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          styles.card,
          color ? { backgroundColor: color } : null,
          cardTransform,
        ]}
      >
        {/* Tekstblok */}
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

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

        {/* Leaf illustratie */}
        <Animated.Image source={LEAF_IMG} style={[styles.leaf, rotateStyle]} />

        {/* Add / Saved knop */}
        <Pressable
          onPress={handlePressSaved}
          hitSlop={10}
          style={[styles.addButton, saved && styles.addButtonSaved]}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Ionicons
              name={saved ? 'checkmark' : 'add'}
              size={22}
              color={saved ? '#ffffff' : COLORS.primaryDark}
            />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Pressable>
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
    fontFamily: FONTS.heading,
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
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
