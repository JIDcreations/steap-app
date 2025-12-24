// components/BioInput.tsx
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { SPACING, TYPO } from '../styles/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
};

export default function BioInput({
  value,
  onChangeText,
  placeholder = 'Add a short bio…',
  onSubmit,
}: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.6)"
      style={styles.input}
      multiline
      textAlignVertical="top"
      returnKeyType="done"
      blurOnSubmit={true} // <— zorgt dat "Done" de input sluit
      onSubmitEditing={() => {
        // bij multiline vuurt dit soms niet altijd; daarom houden we het simpel
        onSubmit?.();
      }}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',

    ...TYPO.body,
    color: '#ffffff',

    minHeight: 56,
    maxHeight: 160,
  },
});
