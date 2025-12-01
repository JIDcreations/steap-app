// components/FormField.tsx
import React from 'react';
import {
    KeyboardTypeOptions,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { COLORS, SPACING } from '../app/theme';

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
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSoft}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
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
