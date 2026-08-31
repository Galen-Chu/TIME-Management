/**
 * 統計分析分頁(FR-STA):本週/本月分段 + 四卡片——接 domain 真計算。
 */
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card } from '../../components/ui/card';
import { Segmented } from '../../components/ui/segmented';
import { categoryLabelKey, CATEGORY_KEYS } from '../../domain/categories';
import { weekdayIndex } from '../../domain/events';
import { computeRangeStats, monthRange, weekRange, workTrend, type RangeStats } from '../../domain/stats';
import { formatHours } from '../../i18n/format';
import { currentLanguage, useSettings } from '../../state/settings';
import { useTodayStore } from '../../state/todayStore';
import { categoryColor, color, font } from '../../theme';

type Range = 'week' | 'month';

export default function StatsScreen() {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);
  const { date, weekEvents } = useTodayStore();
  const [range, setRange] = useState<Range>('week');
  const [stats, setStats] = useState<RangeStats | null>(null);
  const [trend, setTrend] = useState<{ diffHours: number } | null>(null);

  useEffect(() => {
    const r = range === 'week' ? weekRange(date) : monthRange(date);
    setStats(computeRangeStats(weekEvents, r.from, r.to, range === 'week' ? 7 : 30));
    setTrend(range === 'week' ? workTrend(weekEvents, weekRange(date), date) : null);
  }, [range, date, weekEvents]);

  if (!stats) return null;

  const maxAvg = stats.byCategory[0]?.avgPerDay ?? 1;
  const trendText = trend
    ? t(trend.diffHours >= 0 ? 'insights.trendUp' : 'insights.trendDown', {
        diff: Math.abs(trend.diffHours).toFixed(1),
      })
    : '';
  const insight = stats.workAvgPerDay != null
    ? t('insights.workAvg', {
        avg: stats.workAvgPerDay.toFixed(1),
        trend: trendText || '—',
        period: `${t('schedule.weekdayFull.1')}–${t('schedule.weekdayFull.5')}`,
      })
    : t('empty.stats.title');

  const stackedDays = range === 'week' ? stats.perDay : stats.perDay.slice(-7);

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
            <Text style={styles.bigNumber}>{stats.loggedDays}</Text>
            <Text style={styles.coverage}>
              {t('stats.coverage', {
                days: stats.totalDays,
                p: String(Math.round(stats.coverage * 100)),
              })}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${Math.round(stats.coverage * 100)}%` }]}
            />
          </View>
        </Card>

        {/* 卡 2:各類別時間分佈 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('stats.breakdown')}</Text>
          {stats.byCategory.length === 0 ? (
            <Text style={styles.empty}>{t('empty.stats.body')}</Text>
          ) : (
            stats.byCategory.map((b) => (
              <View key={b.key} style={styles.breakRow}>
                <View style={[styles.dot, { backgroundColor: categoryColor(b.key) }]} />
                <Text style={styles.breakLabel}>{t(categoryLabelKey(b.key))}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(b.avgPerDay / maxAvg) * 100}%`,
                        backgroundColor: categoryColor(b.key),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.breakValue}>{formatHours(b.avgPerDay, lang)}</Text>
              </View>
            ))
          )}
        </Card>

        {/* 卡 3:每日紀錄堆疊圖 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('stats.stacked')}</Text>
          <View style={styles.stackRow}>
            {stackedDays.map((d) => {
              const total = Object.values(d.hours).reduce((s, v) => s + (v ?? 0), 0);
              const dowIdx = weekdayIndex(d.date);
              return (
                <View key={d.date} style={styles.stackCol}>
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
                  <Text style={[styles.stackLabel, d.date === date && styles.stackLabelToday]}>
                    {t(`schedule.weekday.${dowIdx}`)}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 32, fontFamily: font.rounded.semibold, color: color.ink },
  card: { gap: 10 },
  cardTitle: { fontSize: 15, fontFamily: font.rounded.semibold, color: color.ink },
  daysRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bigNumber: { fontSize: 24, fontFamily: font.rounded.bold, color: color.ink },
  coverage: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: color.trackSoft, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: color.success },
  empty: { fontSize: 13, color: color.inkMuted, fontFamily: font.rounded.medium },
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakLabel: { width: 52, fontSize: 13, color: color.ink, fontFamily: font.rounded.medium },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: color.trackSoft, overflow: 'hidden', flexDirection: 'row' },
  barFill: { height: 10, borderRadius: 5 },
  breakValue: { width: 56, textAlign: 'right', fontSize: 12, color: color.inkSecondary, fontVariant: ['tabular-nums'] },
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
