import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';

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

  // main anim (0..1)
  const anim = useRef(new Animated.Value(0)).current;

  // micro anims
  const iconPop = useRef(new Animated.Value(0)).current; // 0..1
  const textFade = useRef(new Animated.Value(0)).current; // 0..1

  // cancel previous hide timers when spammed
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const show = useCallback(
    (opts: ToastPillOptions) => {
      clearHideTimer();

      setMessage(opts.message);
      setIcon(opts.icon ?? 'checkmark-circle');
      setVisible(true);

      // reset
      anim.stopAnimation();
      iconPop.stopAnimation();
      textFade.stopAnimation();

      anim.setValue(0);
      iconPop.setValue(0);
      textFade.setValue(0);

      // entrance: spring + settle
      Animated.parallel([
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 160,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(iconPop, {
            toValue: 1,
            friction: 5,
            tension: 220,
            useNativeDriver: true,
          }),
          Animated.timing(iconPop, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      // auto-hide
      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(textFade, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
        });
      }, 1500);
    },
    [anim, iconPop, textFade]
  );

  const toastOpacity = anim;
  const toastTranslateY = useMemo(() => {
    return anim.interpolate({
      inputRange: [0, 1],
      outputRange: [24, 0],
    });
  }, [anim]);

  const toastScale = useMemo(() => {
    return anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.98, 1],
    });
  }, [anim]);

  const iconScale = useMemo(() => {
    return iconPop.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.12],
    });
  }, [iconPop]);

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
            transform: [
              { translateY: toastTranslateY },
              { scale: toastScale },
            ],
            shadowColor: '#000',
            shadowOpacity: 0.22,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Ionicons
              name={icon}
              size={22}
              color={COLORS.primaryTextOnDark}
            />
          </Animated.View>

          <Animated.Text
            style={{
              ...TYPO.body,
              color: COLORS.primaryTextOnDark,
              marginLeft: 8,
              opacity: textFade,
            }}
            numberOfLines={2}
          >
            {message}
          </Animated.Text>
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
      toastScale,
      iconScale,
      textFade,
    ]
  );

  return { show, Toast };
}
