/**
 * 週檢視(FR-TOD):說明文字 + 週一至日 7 列,左星期標籤(今天粗體深色)、
 * 右「24h」、14px 堆疊色條依類別佔比。長按互動 Phase 2 接資料。
 */
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CATEGORY_KEYS } from '../../domain/categories';
import { currentLanguage, useSettings } from '../../state/settings';
import { mockWeek } from '../../mock/today';
import { categoryColor, color, font, radius } from '../../theme';

/** 週一在前 */
const ORDERED = [1, 2, 3, 4, 5, 6, 0];
const TODAY_WEEKDAY = 1; // mock 基準日 2026-08-24 週一

export function WeekView() {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>{t('today.weekHint')}</Text>
      {ORDERED.map((wd) => {
        const day = mockWeek.find((d) => d.weekday === wd);
        const total = Object.values(day?.hours ?? {}).reduce((s, v) => s + (v ?? 0), 0);
        const isToday = wd === TODAY_WEEKDAY;
        return (
          <View key={wd} style={styles.row}>
            <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
              {t(`schedule.weekdayFull.${wd}`)}
            </Text>
            <View style={styles.barTrack}>
              {CATEGORY_KEYS.map((k) => {
                const h = day?.hours?.[k] ?? 0;
                if (h <= 0) return null;
                return (
                  <View
                    key={k}
                    accessibilityLabel={t(`categories.${k}`) + ' ' + String(h)}
                    style={{
                      width: `${(h / 24) * 100}%`,
                      backgroundColor: categoryColor(k),
                    }}
                  />
                );
              })}
            </View>
            <Text style={[styles.total, isToday && styles.dayLabelToday]}>24h</Text>
          </View>
        );
      })}
      {/* 圖例 */}
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
  hint: {
    fontSize: 13,
    color: color.inkSecondary,
    fontFamily: font.rounded.medium,
    lineHeight: 19,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayLabel: {
    width: 44,
    fontSize: 12,
    color: color.inkMuted,
    fontFamily: font.rounded.medium,
  },
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
