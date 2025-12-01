// components/PostButton.tsx
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../app/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function PostButton({ title, onPress, disabled, loading }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor: isDisabled ? COLORS.backgroundAlt : COLORS.primaryDark },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.primaryTextOnDark} />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
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
