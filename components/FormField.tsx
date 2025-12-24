import React, { useRef } from 'react';
import {
  Animated,
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
};

const INPUT_HEIGHT = 50;

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: Props) {
  // focus animation
  const focusAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    Animated.spring(focusAnim, {
      toValue: 1,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  const onBlur = () => {
    Animated.spring(focusAnim, {
      toValue: 0,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View
        style={{
          transform: [
            {
              translateY: focusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -3],
              }),
            },
            {
              scale: focusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.015],
              }),
            },
          ],
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSoft}
          keyboardType={keyboardType}
          onFocus={onFocus}
          onBlur={onBlur}
          style={styles.input}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: INPUT_HEIGHT,
    backgroundColor: 'transparent',
  },
});
