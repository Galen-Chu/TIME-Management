/**
 * 卡片 Card(DESIGN-SPEC):白底、radius 18、padding 16、卡片陰影。
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color, radius, shadow, spacing } from '../../theme';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: PropsWithChildren<Props>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.cardPadding,
    ...shadow.card,
  },
});
