import { palette, radius, spacing } from '../app/styles/palette';


import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type Props = {
  name: string;
  typeName?: string;
  userName?: string;
  note?: string;
  saved?: boolean;
  onToggleSaved?: () => void;
};

export default function TeaCard({
  name,
  typeName,
  userName,
  note,
  saved,
  onToggleSaved,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: palette.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: '#202020',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={{ color: palette.text, fontSize: 18, fontWeight: '800' }}>
            {name}
          </Text>
          <Text style={{ color: palette.textMuted, marginTop: 4 }}>
            {typeName || 'Unknown type'} • {userName ?? '—'}
          </Text>
          {note ? (
            <Text
              numberOfLines={2}
              style={{ color: '#CFCFCF', marginTop: 6 }}
            >
              {note}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onToggleSaved}
          hitSlop={8}
          style={{
            backgroundColor: saved ? palette.chipActiveBg : palette.chipBg,
            borderRadius: radius.md,
            padding: 10,
          }}
        >
          <Ionicons
            name={saved ? 'checkmark' : 'add'}
            size={18}
            color={saved ? palette.chipActiveText : palette.text}
          />
        </Pressable>
      </View>
    </View>
  );
}
