/**
 * 統計分析分頁(FR-STA):本週/本月分段 + 四卡片。
 * Phase 1 虛擬資料;口徑計算 Phase 3 以領域純函式取代。
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card } from '../../components/ui/card';
import { Segmented } from '../../components/ui/segmented';
import { categoryLabelKey } from '../../domain/categories';
import { formatHours, formatPercent } from '../../i18n/format';
import { currentLanguage, useSettings } from '../../state/settings';
import { mockStats, mockWeek } from '../../mock/today';
import { CATEGORY_KEYS } from '../../domain/categories';
import { categoryColor, color, font, radius } from '../../theme';

type Range = 'week' | 'month';

export default function StatsScreen() {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);
  const [range, setRange] = useState<Range>('week');

  const maxAvg = Math.max(...mockStats.breakdown.map((b) => b.avg));
  const trend = t(mockStats.workTrendDiff >= 0 ? 'insights.trendUp' : 'insights.trendDown', {
    diff: Math.abs(mockStats.workTrendDiff).toFixed(1),
  });
  const insight = t('insights.workAvg', {
    avg: mockStats.workAvgPerDay.toFixed(1),
    trend,
    period: t('schedule.weekdayFull.1') + '–' + t('schedule.weekdayFull.5'),
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('stats.title')}</Text>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: 'week', label: t('stats.week') },
              { value: 'month', label: t('stats.month') },
            ]}
          />
        </View>

        {/* 卡 1:已記錄天數 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('stats.loggedDays')}</Text>
          <View style={styles.daysRow}>
            <Text style={styles.bigNumber}>{mockStats.loggedDays}</Text>
            <Text style={styles.coverage}>
              {t('stats.coverage', {
                days: mockStats.totalDays,
                p: String(Math.round(mockStats.coverage * 100)),
              })}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: formatPercentWidth(mockStats.coverage) }]} />
          </View>
        </Card>

        {/* 卡 2:各類別時間分佈 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('stats.breakdown')}</Text>
          {mockStats.breakdown.map((b) => (
            <View key={b.key} style={styles.breakRow}>
              <View style={[styles.dot, { backgroundColor: categoryColor(b.key) }]} />
              <Text style={styles.breakLabel}>{t(categoryLabelKey(b.key))}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(b.avg / maxAvg) * 100}%`, backgroundColor: categoryColor(b.key) },
                  ]}
                />
              </View>
              <Text style={styles.breakValue}>{formatHours(b.avg, lang)}</Text>
            </View>
          ))}
          <Text style={styles.perDay}>{t('stats.perDay', { n: '…' })}</Text>
        </Card>

        {/* 卡 3:每日紀錄堆疊圖 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('stats.stacked')}</Text>
          <View style={styles.stackRow}>
            {mockWeek.map((d) => {
              const total = Object.values(d.hours).reduce((s, v) => s + (v ?? 0), 0);
              return (
                <View key={d.weekday} style={styles.stackCol}>
                  <View style={styles.stackBar}>
                    {CATEGORY_KEYS.map((k) => {
                      const h = d.hours[k] ?? 0;
                      if (h <= 0) return null;
                      return (
                        <View
                          key={k}
                          style={{ height: `${(h / total) * 100}%`, backgroundColor: categoryColor(k) }}
                        />
                      );
                    })}
                  </View>
                  <Text style={[styles.stackLabel, d.weekday === 1 && styles.stackLabelToday]}>
                    {t(`schedule.weekday.${d.weekday}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* 卡 4:洞察 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('stats.insights')}</Text>
          <View style={styles.insightRow}>
            <View style={[styles.dot, { backgroundColor: categoryColor('work') }]} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatPercentWidth(ratio: number): `${number}%` {
  return `${Math.round(ratio * 100)}%`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 32, fontFamily: font.rounded.semibold, color: color.ink },
  card: { gap: 10 },
  cardTitle: { fontSize: 15, fontFamily: font.rounded.semibold, color: color.ink },
  daysRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bigNumber: { fontSize: 24, fontFamily: font.rounded.bold, color: color.ink },
  coverage: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: color.trackSoft,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: color.success },
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakLabel: { width: 52, fontSize: 13, color: color.ink, fontFamily: font.rounded.medium },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.trackSoft,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: { height: 10, borderRadius: 5 },
  breakValue: { width: 56, textAlign: 'right', fontSize: 12, color: color.inkSecondary, fontVariant: ['tabular-nums'] },
  perDay: { fontSize: 12, color: color.inkMuted, fontFamily: font.rounded.medium },
  stackRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  stackCol: { flex: 1, alignItems: 'center', gap: 4 },
  stackBar: {
    width: '100%',
    height: 110,
    borderRadius: 8,
    backgroundColor: color.trackSoft,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
  },
  stackLabel: { fontSize: 11, color: color.inkMuted, fontFamily: font.rounded.medium },
  stackLabelToday: { color: color.ink, fontFamily: font.rounded.bold },
  insightRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  insightText: { flex: 1, fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium, lineHeight: 20 },
});
