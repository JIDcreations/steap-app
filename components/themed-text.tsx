// components/themed-text.tsx
import { StyleSheet, Text, type TextProps } from 'react-native'
import { useThemeColor } from '@/hooks/use-theme-color'

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')

  return (
    <Text
      {...rest}
      style={[
        { color },
        type === 'default' && styles.default,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        style, // allow overrides last
      ]}
    />
  )
}

const styles = StyleSheet.create({
  // Body – Inter Regular
  default: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },

  // SemiBold – Inter Bold (geen fontWeight!)
  defaultSemiBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 24,
  },

  // Title – Playfair Display Bold
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 0.5,
  },

  // Subtitle – Inter Bold
  subtitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 26,
  },

  // Link – Inter Bold + kleur
  link: {
    fontFamily: 'Inter_700Bold',
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
})
