/**
 * 日誌卡檢視(FR-TOD 3):
 * 兩張統計卡 + 今日排程 + 每日例行工事 + 已完成 + AI 預測待確認。
 * Phase 1 為虛擬資料靜態骨架;「有資料才顯示」區塊照 ADDENDUM §B3 原則。
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../ui/card';
import { categoryLabelKey } from '../../domain/categories';
import { formatHours, formatRange } from '../../i18n/format';
import { currentLanguage, useSettings } from '../../state/settings';
import {
  mockEvents,
  mockRoutines,
  mockSchedules,
  type MockEvent,
} from '../../mock/today';
import { categoryColor, color, font, radius } from '../../theme';

export function BlocksView() {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);

  const confirmed = mockEvents.filter((e) => !e.predicted);
  const predicted = mockEvents.filter((e) => e.predicted);
  const workHours = confirmed
    .filter((e) => e.category === 'work')
    .reduce((s, e) => s + (e.end - e.start), 0);
  const doneRoutines = mockRoutines.filter((r) => r.done).length;

  return (
    <View style={styles.wrap}>
      {/* 統計卡兩張 */}
      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>{t('today.workDone')}</Text>
          <Text style={styles.statValue}>{formatHours(workHours, lang)}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>{t('today.routineDone')}</Text>
          <Text style={styles.statValue}>
            {doneRoutines}/{mockRoutines.length}
          </Text>
        </Card>
      </View>

      {/* 今日排程(ADDENDUM §A4;Phase 3 完整互動) */}
      <SectionTitle>{t('schedule.today')}</SectionTitle>
      {mockSchedules.map((s) => (
        <Card key={s.id} style={styles.row}>
          <View style={[styles.catBadge, { backgroundColor: categoryColor(s.category) }]} />
          <View style={styles.rowMain}>
            <Text style={styles.rowTitle}>{lang === 'zh-TW' ? s.titleZh : s.titleEn}</Text>
            <Text style={styles.rowMeta}>
              {t('schedule.time')} {formatRange(s.time, s.time + s.durationH)}
            </Text>
          </View>
        </Card>
      ))}

      {/* 每日例行工事 */}
      <SectionTitle>{t('today.routines')}</SectionTitle>
      {mockRoutines.map((r) => (
        <Pressable key={r.id} accessibilityRole="checkbox" style={styles.cardTouchable}>
          <Card style={styles.row}>
            <View style={[styles.check, r.done && styles.checkDone]}>
              {r.done ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <View style={styles.rowMain}>
              <Text style={[styles.rowTitle, r.done && styles.doneTitle]}>
                {lang === 'zh-TW' ? r.labelZh : r.labelEn}
              </Text>
              <Text style={styles.rowMeta}>
                {t('today.streak', { count: r.streak })} · {t('today.about', { time: r.timeHint })}
              </Text>
            </View>
          </Card>
        </Pressable>
      ))}

      {/* 已完成 */}
      {confirmed.length > 0 && (
        <>
          <SectionTitle>{t('today.confirmed')}</SectionTitle>
          {confirmed.map((e) => (
            <EventRow key={e.id} event={e} lang={lang} />
          ))}
        </>
      )}

      {/* AI 預測 · 待確認 */}
      {predicted.length > 0 && (
        <>
          <SectionTitle>{t('today.predicted')}</SectionTitle>
          {predicted.map((e) => (
            <View
              key={e.id}
              style={[
                styles.predictedCard,
                { borderColor: categoryColor(e.category) },
              ]}
            >
              <View style={[styles.catBadge, { backgroundColor: categoryColor(e.category) }]} />
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, { color: categoryColor(e.category) }]}>
                  {lang === 'zh-TW' ? e.labelZh : e.labelEn}
                </Text>
                <Text style={styles.rowMeta}>{formatRange(e.start, e.end)}</Text>
              </View>
              <View style={styles.confirmTag}>
                <Text style={styles.confirmTagText}>{t('today.confirmTag')}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

function EventRow({ event, lang }: { event: MockEvent; lang: 'zh-TW' | 'en-US' }) {
  const { t } = useTranslation();
  return (
    <Card style={styles.row}>
      <View style={[styles.catBadge, { backgroundColor: categoryColor(event.category) }]} />
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{lang === 'zh-TW' ? event.labelZh : event.labelEn}</Text>
        <Text style={styles.rowMeta}>
          {t(categoryLabelKey(event.category))} · {formatRange(event.start, event.end)}
        </Text>
      </View>
    </Card>
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
  cardTouchable: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  catBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
  },
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
  confirmTag: {
    backgroundColor: color.track,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  confirmTagText: { fontSize: 12, color: color.ink, fontFamily: font.rounded.semibold },
});
