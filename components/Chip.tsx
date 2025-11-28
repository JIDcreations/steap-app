// components/Chip.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../app/theme';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export default function Chip({ label, active = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: active ? COLORS.primaryDark : 'transparent',
          borderColor: COLORS.primaryDark,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: active ? COLORS.primaryTextOnDark : COLORS.primaryDark,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 38,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md, // 8px
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
