/**
 * 偵測通知 Toast(DESIGN-SPEC / FR-DTC):
 * 頂部深色(ink)卡 radius 16;左側 accent 圓點 1.6s 脈動(opacity 1→0.55、scale 1→0.75);
 * 進場 translateY 10→0 + 淡入 0.35s;動作:accentLight 粗體主動作/半透明次動作。
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { color, font, radius, shadow } from '../../theme';

interface Props {
  message: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}

export function Toast({ message, primaryLabel, secondaryLabel, onPrimary, onSecondary }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.55, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    Animated.timing(entrance, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    return () => loop.stop();
  }, [pulse, entrance]);

  const scale = pulse.interpolate({ inputRange: [0.55, 1], outputRange: [0.75, 1] });

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: entrance,
          transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
    >
      <View style={styles.topRow}>
        <Animated.View style={[styles.dot, { opacity: pulse, transform: [{ scale }] }]} />
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onPrimary} accessibilityRole="button">
          <Text style={styles.primary}>{primaryLabel}</Text>
        </Pressable>
        <Pressable onPress={onSecondary} accessibilityRole="button">
          <Text style={styles.secondary}>{secondaryLabel}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    backgroundColor: color.ink,
    borderRadius: radius.row,
    padding: 14,
    marginHorizontal: 20,
    ...shadow.toast,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.accent,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: font.rounded.medium,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 10,
  },
  primary: {
    color: color.accentLight,
    fontFamily: font.rounded.bold,
    fontSize: 13,
  },
  secondary: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: font.rounded.medium,
    fontSize: 13,
  },
});
