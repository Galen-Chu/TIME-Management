/**
 * 分段控制 Segmented(DESIGN-SPEC):
 * 藥丸容器(track 底、radius 100、padding 3);
 * 作用中 = ink 實底 + bg 文字 700;非作用中 = inkSecondary 文字 600。
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, font, radius } from '../../theme';

interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface Props<T extends string | number> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel?: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<T>) {
  return (
    <View
      style={styles.container}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.value)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.itemText, active && styles.itemTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: color.track,
    borderRadius: radius.pill,
    padding: 3,
    alignSelf: 'flex-start',
  },
  item: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  itemActive: {
    backgroundColor: color.ink,
  },
  itemText: {
    fontFamily: font.rounded.semibold,
    fontSize: 13,
    color: color.inkSecondary,
  },
  itemTextActive: {
    color: color.bg,
    fontFamily: font.rounded.bold,
  },
});
