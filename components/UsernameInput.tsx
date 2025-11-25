// components/UsernameInput.tsx
import { StyleSheet, TextInput } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../app/theme';

type UsernameInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit: () => void;
};

export function UsernameInput({
  value,
  onChangeText,
  placeholder,
  onSubmit,
}: UsernameInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#ffffffff"
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.input}
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
