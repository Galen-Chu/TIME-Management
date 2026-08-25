/**
 * 排程管理畫面(DESIGN-ADDENDUM §A2):
 * 標題+「＋ 新增」;清單依下次發生排序;列=類別色塊+標題+重複描述+時間+提醒開關;
 * 今天適用的列副行前 accent 點;點列(開關除外)開排程表單(§A3)。
 */
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { Toggle } from '../ui/toggle';
import { categoryColor, color, font } from '../../theme';
import { formatClock } from '../../i18n/format';
import { occursOn, recurrenceParams, sortSchedules } from '../../domain/schedule';
import { useTodayStore } from '../../state/todayStore';
import type { ScheduleItem } from '../../data/schedule-types';
import { ScheduleFormSheet } from './schedule-form-sheet';

export function ScheduleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { schedules, date, saveSchedule, deleteSchedule } = useTodayStore();
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [creating, setCreating] = useState(false);

  const sorted = sortSchedules(schedules, date);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{t('schedule.title')}</Text>
        <Pressable accessibilityRole="button" onPress={() => setCreating(true)} style={styles.addBtn}>
          <Text style={styles.addText}>＋ {t('schedule.add')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sorted.length === 0 ? (
          <EmptyState
            title={t('empty.schedule.title')}
            body={t('empty.schedule.body')}
            ctaLabel={t('schedule.addSchedule')}
            onCta={() => setCreating(true)}
          />
        ) : (
          sorted.map((s) => {
            const today = occursOn(s, date);
            const p = recurrenceParams(s);
            return (
              <Card key={s.id} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: categoryColor(s.category) }]} />
                <Pressable style={styles.rowMain} onPress={() => setEditing(s)} accessibilityRole="button">
                  <Text style={styles.rowTitle}>
                    {today ? <Text style={styles.todayDot}>● </Text> : null}
                    {s.title}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {p.recurrenceKey === 'schedule.recurrence.once' && s.date
                      ? `${t('schedule.recurrence.once')} · ${s.date}`
                      : t('schedule.repeatRule', {
                          recurrence: t(p.recurrenceKey),
                          weekdays: p.weekdayKeys.map((w) => t(`schedule.weekday.${w}`)).join(t('schedule.weekdaySep')),
                        })}
                    {' · '}
                    {formatClock(s.time)}
                  </Text>
                </Pressable>
                <Toggle
                  accessibilityLabel={t('schedule.reminder')}
                  value={s.reminderOn}
                  onChange={(v) => void saveSchedule({ ...s, reminderOn: v })}
                />
              </Card>
            );
          })
        )}
      </ScrollView>

      <ScheduleFormSheet
        item={editing}
        creating={creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  back: { padding: 6 },
  backText: { fontSize: 26, color: color.inkSecondary, fontFamily: font.karla.regular },
  title: { flex: 1, fontSize: 26, fontFamily: font.rounded.semibold, color: color.ink },
  addBtn: {
    backgroundColor: color.ink,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addText: { color: color.bg, fontSize: 13, fontFamily: font.rounded.bold },
  content: { padding: 20, paddingTop: 4, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    opacity: 0.9,
  },
  rowMain: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontFamily: font.rounded.semibold, color: color.ink },
  rowMeta: {
    fontSize: 12,
    color: color.inkMuted,
    fontFamily: font.rounded.medium,
    fontVariant: ['tabular-nums'],
  },
  todayDot: { color: color.accent, fontSize: 10 },
});
