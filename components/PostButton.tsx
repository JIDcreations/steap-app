import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { COLORS } from '../app/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function PostButton({
  title,
  onPress,
  disabled,
  loading,
}: Props) {
  const isDisabled = disabled || loading;

  // animations
  const pressAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // fade when disabled/loading
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isDisabled ? 0.7 : 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [isDisabled, fadeAnim]);

  const onPressIn = () => {
    if (isDisabled) return;
    Animated.spring(pressAnim, {
      toValue: 0.97,
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

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: isDisabled
              ? COLORS.backgroundAlt
              : COLORS.primaryDark,
            opacity: fadeAnim,
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primaryTextOnDark} />
        ) : (
          <Text style={styles.label}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: COLORS.primaryTextOnDark,
    fontSize: 16,
    fontWeight: '600',
  },
});
