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

const FLOWER_IMG: ImageSourcePropType = require('../assets/images/FlowerPlant.png');

type Props = {
  name: string;
  typeName?: string;
  rating?: number;
  color?: string;
  saved?: boolean;
  onToggleSaved?: () => void;
  onPressCard?: () => void;
};

export default function TeaRowCard({
  name,
  typeName,
  rating,
  color,
  saved = false,
  onToggleSaved,
  onPressCard,
}: Props) {
  // Card press animation (0..1)
  const cardPress = useRef(new Animated.Value(0)).current;

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
            outputRange: [1, 0.988],
          }),
        },
      ],
    }),
    [cardPress]
  );

  // rotatie voor de flower (zoals bij verticale kaart)
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
      // subtle follow on press
      {
        translateY: cardPress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1.5],
        }),
      },
      {
        scale: cardPress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.99],
        }),
      },
    ],
  };

  // smoother icon pop (0..1)
  const iconPop = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // micro feedback on state change
    animatePop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  const handlePressSaved = (event: GestureResponderEvent) => {
    // voorkomen dat de tap ook de card-press triggert
    event.stopPropagation();
    animatePop();
    onToggleSaved?.();
  };

  const iconScale = useMemo(() => {
    return iconPop.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.14],
    });
  }, [iconPop]);

  return (
    <Pressable onPress={onPressCard} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.card,
          color ? { backgroundColor: color } : null,
          cardTransform,
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
    paddingRight: 80,
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
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
