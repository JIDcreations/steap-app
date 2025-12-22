import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../app/theme';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function Chip({ label, active = false, onPress }: Props) {
  // press + active animations
  const pressAnim = useRef(new Animated.Value(1)).current;
  const activeAnim = useRef(new Animated.Value(0)).current;

  // pulse when chip becomes active
  useEffect(() => {
    if (active) {
      activeAnim.setValue(0);
      Animated.sequence([
        Animated.spring(activeAnim, {
          toValue: 1,
          friction: 5,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.spring(activeAnim, {
          toValue: 0,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [active, activeAnim]);

  const onPressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.96,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  const scale = Animated.multiply(
    pressAnim,
    activeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.06],
    })
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          styles.base,
          {
            backgroundColor: active ? COLORS.primaryDark : 'transparent',
            borderColor: COLORS.primaryDark,
            transform: [{ scale }],
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: active
                ? COLORS.primaryTextOnDark
                : COLORS.primaryDark,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 38,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  text: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
});
