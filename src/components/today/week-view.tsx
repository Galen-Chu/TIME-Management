/**
 * 週檢視(FR-TOD):7 日堆疊條(週一在前)。長按 → 該日日檢視(onPickDate)。
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CATEGORY_KEYS } from '../../domain/categories';
import { hoursByCategory, shiftDate, type Event } from '../../domain/events';
import { currentLanguage, useSettings } from '../../state/settings';
import { categoryColor, color, font } from '../../theme';

const ORDERED = [1, 2, 3, 4, 5, 6, 0];

interface Props {
  weekEvents: Event[];
  date: string; // 所在日
  onPickDate: (date: string) => void;
}

export function WeekView({ weekEvents, date, onPickDate }: Props) {
  const { t } = useTranslation();

  // 週一為首
  const wd = new Date(`${date}T00:00:00`).getDay();
  const idx = wd === 0 ? 7 : wd;
  const weekStart = shiftDate(date, -(idx - 1));

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>{t('today.weekHint')}</Text>
      {ORDERED.map((dow, i) => {
        const dayKey = shiftDate(weekStart, i);
        const dayEvents = weekEvents.filter((e) => e.date === dayKey && !e.predicted);
        const hours = hoursByCategory(dayEvents);
        const isToday = dayKey === date;
        return (
          <Pressable
            key={dow}
            onLongPress={() => onPickDate(dayKey)}
            accessibilityRole="button"
            accessibilityLabel={dayKey}
          >
            <View style={styles.row}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {t(`schedule.weekdayFull.${i + 1}`)}
              </Text>
              <View style={styles.barTrack}>
                {CATEGORY_KEYS.map((k) => {
                  const h = hours[k] ?? 0;
                  if (h <= 0) return null;
                  return (
                    <View
                      key={k}
                      style={{ width: `${(h / 24) * 100}%`, backgroundColor: categoryColor(k) }}
                    />
                  );
                })}
              </View>
              <Text style={[styles.total, isToday && styles.dayLabelToday]}>24h</Text>
            </View>
          </Pressable>
        );
      })}
      <View style={styles.legend}>
        {CATEGORY_KEYS.map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: categoryColor(k) }]} />
            <Text style={styles.legendText}>{t(`categories.${k}`)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  hint: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium, lineHeight: 19, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayLabel: { width: 44, fontSize: 12, color: color.inkMuted, fontFamily: font.rounded.medium },
  dayLabelToday: { color: color.ink, fontFamily: font.rounded.bold },
  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: color.trackSoft,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  total: { width: 28, textAlign: 'right', fontSize: 12, color: color.inkMuted, fontFamily: font.karla.regular },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '25%' },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: color.inkSecondary, fontFamily: font.rounded.medium },
});
