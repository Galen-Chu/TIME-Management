/**
 * 事件表單 Sheet 底盤(DESIGN-SPEC):
 * 遮罩 rgba(46,42,37,0.4);面板 bg 底、上緣 radius 24、把手 36×4 trackAlt;
 * 進場 translateY 100%→0,0.3s ease。
 */
import { useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { color, radius, shadow } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function BottomSheet({ visible, onClose, children }: PropsWithChildren<Props>) {
  const { t } = useTranslation();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  if (!visible) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.mask, { opacity: progress }]} pointerEvents="auto">
        <Pressable accessibilityLabel={t('common.close')} style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.panel, { transform: [{ translateY }] }]} pointerEvents="auto">
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mask: {
    backgroundColor: 'rgba(46,42,37,0.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.sheetTop,
    borderTopRightRadius: radius.sheetTop,
    paddingBottom: 24,
    ...shadow.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.trackAlt,
    marginTop: 10,
    marginBottom: 6,
  },
});
