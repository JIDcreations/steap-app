import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { COLORS, FONTS, RADIUS, SPACING } from '../styles/theme';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search for teas',
  onClear,
  ...rest
}: Props) {
  const showClear = value.length > 0 && !!onClear;

  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={20}
        color={COLORS.primaryDark}
        style={styles.icon}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSoft}
        style={styles.input}
        returnKeyType="search"
        {...rest}
      />

      {showClear && (
        <Pressable hitSlop={8} onPress={onClear} style={styles.clearButton}>
          <Ionicons
            name="close"
            size={16}
            color={COLORS.primaryDark}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,                 // vaste hoogte volgens Figma
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: 'transparent', // geen fill

    borderRadius: RADIUS.md,   // 8px
    borderWidth: 1,
    borderColor: COLORS.primaryDark,

    paddingHorizontal: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.primaryDark,   // tekstkleur primary
  },
  clearButton: {
    marginLeft: SPACING.sm,
  },
});
