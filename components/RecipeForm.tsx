// components/RecipeForm.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, TextInput, View } from 'react-native';

import { COLORS, SPACING } from '@/styles/theme';

type Props = {
  recipeIngredients: string;
  setRecipeIngredients: (v: string) => void;

  recipeWaterMl: string;
  setRecipeWaterMl: (v: string) => void;

  recipeTempC: string;
  setRecipeTempC: (v: string) => void;

  recipeAmount: string;
  setRecipeAmount: (v: string) => void;

  recipeSteps: string;
  setRecipeSteps: (v: string) => void;
};

export default function RecipeForm({
  recipeIngredients,
  setRecipeIngredients,
  recipeWaterMl,
  setRecipeWaterMl,
  recipeTempC,
  setRecipeTempC,
  recipeAmount,
  setRecipeAmount,
  recipeSteps,
  setRecipeSteps,
}: Props) {
  // Entrance
  const inAnim = useRef(new Animated.Value(0)).current; // 0..1

  // Focus micro-anim per field
  const ingF = useRef(new Animated.Value(0)).current;
  const waterF = useRef(new Animated.Value(0)).current;
  const tempF = useRef(new Animated.Value(0)).current;
  const amountF = useRef(new Animated.Value(0)).current;
  const stepsF = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(inAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // tiny extra “settle”
      Animated.timing(inAnim, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [inAnim]);

  const focusIn = (v: Animated.Value) => {
    Animated.spring(v, {
      toValue: 1,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const focusOut = (v: Animated.Value) => {
    Animated.spring(v, {
      toValue: 0,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const fieldWrapStyle = (v: Animated.Value) => ({
    transform: [
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
      {
        scale: v.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.015],
        }),
      },
    ],
  });

  return (
    <Animated.View
      style={{
        opacity: inAnim,
        transform: [
          {
            translateY: inAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <View style={{ marginBottom: SPACING.md }}>
        <Text
          style={{
            fontSize: 16,
            color: COLORS.primaryDark,
            marginBottom: 6,
          }}
        >
          Recipe
        </Text>

        <Animated.View style={fieldWrapStyle(ingF)}>
          <TextInput
            value={recipeIngredients}
            onChangeText={setRecipeIngredients}
            placeholder="Ingredients (comma separated) e.g. mint, ginger, green tea"
            placeholderTextColor={COLORS.textSoft}
            onFocus={() => focusIn(ingF)}
            onBlur={() => focusOut(ingF)}
            style={{
              borderWidth: 1,
              borderColor: COLORS.primaryDark,
              borderRadius: 8,
              paddingHorizontal: SPACING.md,
              backgroundColor: 'transparent',
              paddingVertical: 10,
              marginBottom: 10,
            }}
          />
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Animated.View style={fieldWrapStyle(waterF)}>
              <TextInput
                value={recipeWaterMl}
                onChangeText={setRecipeWaterMl}
                placeholder="Water (ml)"
                placeholderTextColor={COLORS.textSoft}
                keyboardType="number-pad"
                onFocus={() => focusIn(waterF)}
                onBlur={() => focusOut(waterF)}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.primaryDark,
                  borderRadius: 8,
                  paddingHorizontal: SPACING.md,
                  backgroundColor: 'transparent',
                  paddingVertical: 10,
                }}
              />
            </Animated.View>
          </View>

          <View style={{ flex: 1 }}>
            <Animated.View style={fieldWrapStyle(tempF)}>
              <TextInput
                value={recipeTempC}
                onChangeText={setRecipeTempC}
                placeholder="Temp (°C)"
                placeholderTextColor={COLORS.textSoft}
                keyboardType="number-pad"
                onFocus={() => focusIn(tempF)}
                onBlur={() => focusOut(tempF)}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.primaryDark,
                  borderRadius: 8,
                  paddingHorizontal: SPACING.md,
                  backgroundColor: 'transparent',
                  paddingVertical: 10,
                }}
              />
            </Animated.View>
          </View>
        </View>

        <Animated.View style={fieldWrapStyle(amountF)}>
          <TextInput
            value={recipeAmount}
            onChangeText={setRecipeAmount}
            placeholder="Amount e.g. 2g / 1 tsp / 1 bag"
            placeholderTextColor={COLORS.textSoft}
            onFocus={() => focusIn(amountF)}
            onBlur={() => focusOut(amountF)}
            style={{
              borderWidth: 1,
              borderColor: COLORS.primaryDark,
              borderRadius: 8,
              paddingHorizontal: SPACING.md,
              backgroundColor: 'transparent',
              paddingVertical: 10,
              marginBottom: 10,
            }}
          />
        </Animated.View>

        <Animated.View style={fieldWrapStyle(stepsF)}>
          <TextInput
            value={recipeSteps}
            onChangeText={setRecipeSteps}
            placeholder="Steps (optional)"
            placeholderTextColor={COLORS.textSoft}
            multiline
            onFocus={() => focusIn(stepsF)}
            onBlur={() => focusOut(stepsF)}
            style={{
              borderWidth: 1,
              borderColor: COLORS.primaryDark,
              borderRadius: 8,
              paddingHorizontal: SPACING.md,
              backgroundColor: 'transparent',
              minHeight: 90,
              paddingVertical: 10,
              textAlignVertical: 'top',
            }}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
