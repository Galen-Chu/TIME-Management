/**
 * 今天分頁(FR-TOD):標題區 → 日(時間軸/時鐘盤/日誌卡)/週。
 * Phase 2:真資料(todayStore)+ 事件表單 Sheet + 點空白新增 + 週長按進該日。
 */
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { BlocksView } from '../../components/today/blocks-view';
import { ClockView } from '../../components/today/clock-view';
import { EventSheet } from '../../components/today/event-sheet';
import { TimelineView } from '../../components/today/timeline-view';
import { WeekView } from '../../components/today/week-view';
import { Segmented } from '../../components/ui/segmented';
import { createRepositories } from '../../data/db';
import { formatHeaderDate } from '../../i18n/format';
import { useTodayStore } from '../../state/todayStore';
import { color, font, spacing } from '../../theme';
import type { Event } from '../../domain/events';

type DayWeek = 'day' | 'week';
type DayStyle = 'linear' | 'clock' | 'blocks';

export default function TodayScreen() {
  const { t } = useTranslation();
  const { date, events, weekEvents, load } = useTodayStore();

  const [dayWeek, setDayWeek] = useState<DayWeek>('day');
  const [style, setStyle] = useState<DayStyle>('linear');
  const [selected, setSelected] = useState<Event | null>(null);
  const [creating, setCreating] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    (async () => {
      const repos = await createRepositories();
      useTodayStore.getState().attach(repos.events, repos.routines);
      await useTodayStore.getState().load();
    })();
  }, []);

  const headerDate = formatHeaderDate(new Date(`${date}T00:00:00`), 'zh-TW');
  const closeSheet = () => {
    setSelected(null);
    setCreating(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{headerDate}</Text>
            <Text style={styles.title}>{t('today.title')}</Text>
          </View>
          <Segmented
            accessibilityLabel={t('today.title')}
            value={dayWeek}
            onChange={setDayWeek}
            options={[
              { value: 'day', label: t('today.view.day') },
              { value: 'week', label: t('today.view.week') },
            ]}
          />
        </View>

        {dayWeek === 'day' ? (
          <>
            <Segmented
              value={style}
              onChange={setStyle}
              options={[
                { value: 'linear', label: t('today.style.linear') },
                { value: 'clock', label: t('today.style.clock') },
                { value: 'blocks', label: t('today.style.blocks') },
              ]}
            />
            <View style={styles.body}>
              {style === 'linear' && (
                <TimelineView
                  events={events}
                  onSelect={setSelected}
                  onCreate={(start) => setCreating({ start, end: start + 1 })}
                />
              )}
              {style === 'clock' && <ClockView events={events} />}
              {style === 'blocks' && <BlocksView onSelect={setSelected} />}
            </View>
          </>
        ) : (
          <View style={styles.body}>
            <WeekView
              weekEvents={weekEvents}
              date={date}
              onPickDate={(d) => {
                setDayWeek('day');
                void load(d);
              }}
            />
          </View>
        )}
      </ScrollView>

      <EventSheet event={selected} creating={creating} onClose={closeSheet} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  content: { padding: spacing.screenH, paddingBottom: 40, gap: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  date: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium },
  title: { fontSize: 32, fontFamily: font.rounded.semibold, color: color.ink, marginTop: 2 },
  body: { gap: 12 },
});
