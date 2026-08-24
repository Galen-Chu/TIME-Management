/**
 * 空狀態 EmptyState(DESIGN-ADDENDUM §B1):
 * 80px 有機形色塊(trackSoft 底)、標題 15/600 ink、說明 13 inkSecondary(至多兩行)、
 * 可選 CTA 膠囊按鈕(track 底 ink 文字);垂直置中、上下留白 24px;不動畫(安靜)。
 */
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, font, radius } from '../../theme';

interface Props {
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ title, body, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.blob} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body} numberOfLines={2}>
        {body}
      </Text>
      {ctaLabel ? (
        <Pressable accessibilityRole="button" onPress={onCta} style={styles.cta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  blob: {
    width: 80,
    height: 80,
    backgroundColor: color.trackSoft,
    // 有機形:不對稱圓角(Onboarding blob 語彙)
    borderRadius: 40,
    borderTopLeftRadius: 52,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: font.rounded.semibold,
    color: color.ink,
  },
  body: {
    fontSize: 13,
    fontFamily: font.rounded.medium,
    color: color.inkSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginTop: 8,
    backgroundColor: color.track,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  ctaText: {
    color: color.ink,
    fontFamily: font.rounded.semibold,
    fontSize: 13,
  },
});
