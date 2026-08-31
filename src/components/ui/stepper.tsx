/**
 * 步進器 Stepper(DESIGN-SPEC):
 * 28px 圓鈕(track 底、stepperInk 符號 −／＋);值最小寬 56–64px 置中。
 * 夾限與環繞(wrap)由呼叫端以領域函式處理(settings.ts 的 clamp/wrap)。
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { color, font } from '../../theme';

interface Props {
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  minLabel?: string;
  plusLabel?: string;
}

export function Stepper({ value, onDecrement, onIncrement, minLabel = '−', plusLabel = '＋' }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.decrement')}
        onPress={onDecrement}
        style={styles.button}
      >
        <Text style={styles.symbol}>{minLabel}</Text>
      </Pressable>
      <View style={styles.value}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.increment')}
        onPress={onIncrement}
        style={styles.button}
      >
        <Text style={styles.symbol}>{plusLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    color: color.stepperInk,
    fontSize: 16,
    lineHeight: 18,
    fontFamily: font.karla.medium,
  },
  value: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 18,
    color: color.ink,
    fontFamily: font.rounded.semibold,
    fontVariant: ['tabular-nums'],
  },
});
