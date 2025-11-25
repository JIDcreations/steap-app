import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPO } from '../app/theme';

type AuthButtonProps = {
  label: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function AuthButton({
  label,
  loading,
  disabled,
  onPress,
}: AuthButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FDFBFC" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    ...TYPO.bodyMedium,
    color: COLORS.textOnAccent,
  },
});
