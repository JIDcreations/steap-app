// components/ToastPill.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';

type ToastPillOptions = {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type ThemeLike = {
  COLORS: {
    primaryDark: string;
    primaryTextOnDark: string;
  };
  SPACING: {
    lg: number;
    md: number;
  };
  TYPO: {
    body: any;
  };
};

export function useToastPill(theme: ThemeLike) {
  const { COLORS, SPACING, TYPO } = theme;

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [icon, setIcon] =
    useState<keyof typeof Ionicons.glyphMap>('checkmark-circle');

  const anim = useRef(new Animated.Value(0)).current;

  const show = useCallback(
    (opts: ToastPillOptions) => {
      setMessage(opts.message);
      setIcon(opts.icon ?? 'checkmark-circle');

      setVisible(true);
      anim.setValue(0);

      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setVisible(false);
          });
        }, 1400);
      });
    },
    [anim]
  );

  const toastOpacity = anim;
  const toastTranslateY = useMemo(() => {
    return anim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    });
  }, [anim]);

  const Toast = useCallback(
    ({ bottom }: { bottom: number }) => {
      if (!visible) return null;

      return (
        <Animated.View
          style={{
            position: 'absolute',
            left: SPACING.lg,
            right: SPACING.lg,
            bottom,
            paddingVertical: 12,
            paddingHorizontal: SPACING.md,
            borderRadius: 999,
            backgroundColor: COLORS.primaryDark,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <Ionicons
            name={icon}
            size={22}
            color={COLORS.primaryTextOnDark}
          />
          <Text
            style={{
              ...TYPO.body,
              color: COLORS.primaryTextOnDark,
              marginLeft: 8,
            }}
          >
            {message}
          </Text>
        </Animated.View>
      );
    },
    [
      visible,
      icon,
      message,
      COLORS.primaryDark,
      COLORS.primaryTextOnDark,
      SPACING.lg,
      SPACING.md,
      TYPO.body,
      toastOpacity,
      toastTranslateY,
    ]
  );

  return { show, Toast };
}
