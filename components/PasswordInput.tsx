// components/PasswordInput.tsx
import { StyleSheet, TextInput } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../styles/theme';

type PasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit: () => void;
};

export function PasswordInput({
  value,
  onChangeText,
  placeholder,
  onSubmit,
}: PasswordInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#ffffffff"
      secureTextEntry
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.input}
      returnKeyType="done"
      onSubmitEditing={onSubmit}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    color: '#ffffff',
  },
});
