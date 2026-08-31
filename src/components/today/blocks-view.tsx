/**
 * 日誌卡檢視(FR-TOD 3):統計卡×2 + 今日排程 + 例行工事 + 已完成 + AI 預測待確認。
 * Phase 2:接 store 真資料;空狀態依 DESIGN-ADDENDUM §B(常駐區塊才有)。
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { categoryLabelKey } from '../../domain/categories';
import { occursOn } from '../../domain/schedule';
import { durationOf, type Event } from '../../domain/events';
import { formatHours, formatRange } from '../../i18n/format';
import { currentLanguage, useSettings } from '../../state/settings';
import { useTodayStore } from '../../state/todayStore';
import { categoryColor, color, font, radius } from '../../theme';

interface Props {
  onSelect: (e: Event) => void;
}

export function BlocksView({ onSelect }: Props) {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);
  // P2:selector 訂閱——僅重渲染本檢視實際依賴的切片
  const events = useTodayStore((s) => s.events);
  const routines = useTodayStore((s) => s.routines);
  const schedules = useTodayStore((s) => s.schedules);
  const date = useTodayStore((s) => s.date);
  const toggleRoutine = useTodayStore((s) => s.toggleRoutine);
  const routineLabel = (l: string) => (l.startsWith('today.') ? t(l) : l);

  const confirmed = events.filter((e) => !e.predicted);
  const predicted = events.filter((e) => e.predicted);
  const workHours = confirmed
    .filter((e) => e.category === 'work')
    .reduce((s, e) => s + durationOf(e), 0);
  const doneCount = routines.filter((r) => r.doneToday).length;

  // §A4:今日排程區塊(位置在例行工事之上)
  const todaySchedules = schedules.filter((s) => occursOn(s, date));

  return (
    <View style={styles.wrap}>
      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>{t('today.workDone')}</Text>
          <Text style={styles.statValue}>{formatHours(workHours, lang)}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>{t('today.routineDone')}</Text>
          <Text style={styles.statValue}>
            {doneCount}/{routines.length}
          </Text>
        </Card>
      </View>

      {todaySchedules.length > 0 && (
        <>
          <SectionTitle>{t('schedule.today')}</SectionTitle>
          {todaySchedules.map((s) => (
            <View
              key={s.id}
              style={[styles.predictedCard, { borderColor: categoryColor(s.category) }]}
            >
              <View style={[styles.catBadge, { backgroundColor: categoryColor(s.category) }]} />
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, { color: categoryColor(s.category) }]}>{s.title}</Text>
                <Text style={styles.rowMeta}>
                  {t('schedule.time')} {formatRange(s.time, s.time + s.durationH)}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      <SectionTitle>{t('today.routines')}</SectionTitle>
      {routines.length === 0 ? (
        <EmptyState title={t('empty.routines.title')} body={t('empty.routines.body')} />
      ) : (
        routines.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: r.doneToday }}
            onPress={() => toggleRoutine(r.id)}
          >
            <Card style={styles.row}>
              <View style={[styles.check, r.doneToday && styles.checkDone]}>
                {r.doneToday ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, r.doneToday && styles.doneTitle]}>
                  {routineLabel(r.label)}
                </Text>
                <Text style={styles.rowMeta}>
                  {t('today.streak', { count: r.streak })} · {t('today.about', { time: r.timeHint })}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))
      )}

      {confirmed.length > 0 && (
        <>
          <SectionTitle>{t('today.confirmed')}</SectionTitle>
          {confirmed.map((e) => (
            <Card key={e.id} style={styles.row}>
              <View style={[styles.catBadge, { backgroundColor: categoryColor(e.category) }]} />
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{e.label}</Text>
                <Text style={styles.rowMeta}>
                  {t(categoryLabelKey(e.category))} · {formatRange(e.start, e.end)}
                </Text>
              </View>
            </Card>
          ))}
        </>
      )}

      {predicted.length > 0 && (
        <>
          <SectionTitle>{t('today.predicted')}</SectionTitle>
          {predicted.map((e) => (
            <Pressable key={e.id} onPress={() => onSelect(e)} accessibilityRole="button">
              <View style={[styles.predictedCard, { borderColor: categoryColor(e.category) }]}>
                <View style={[styles.catBadge, { backgroundColor: categoryColor(e.category) }]} />
                <View style={styles.rowMain}>
                  <Text style={[styles.rowTitle, { color: categoryColor(e.category) }]}>
                    {e.label || t(categoryLabelKey(e.category))}
                  </Text>
                  <Text style={styles.rowMeta}>{formatRange(e.start, e.end)}</Text>
                </View>
                <View style={styles.confirmTag}>
                  <Text style={styles.confirmTagText}>{t('today.confirmTag')}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </>
      )}

      {events.length === 0 && (
        <EmptyState title={t('empty.log.title')} body={t('empty.log.body')} />
      )}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  statRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, gap: 6 },
  statLabel: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium },
  statValue: { fontSize: 24, fontFamily: font.rounded.bold, color: color.ink },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 2,
    fontSize: 13,
    fontFamily: font.rounded.semibold,
    color: color.inkSecondary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  catBadge: { width: 22, height: 22, borderRadius: 7 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: color.trackAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: color.success },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontFamily: font.rounded.bold },
  rowMain: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontFamily: font.rounded.semibold, color: color.ink },
  doneTitle: { color: color.inkSecondary },
  rowMeta: {
    fontSize: 12,
    color: color.inkMuted,
    fontFamily: font.rounded.medium,
    fontVariant: ['tabular-nums'],
  },
  predictedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.row,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmTag: { backgroundColor: color.track, borderRadius: 100, paddingVertical: 4, paddingHorizontal: 12 },
  confirmTagText: { fontSize: 12, color: color.ink, fontFamily: font.rounded.semibold },
});
