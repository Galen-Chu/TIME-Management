/**
 * 今天分頁(FR-TOD):標題區 → 日(時間軸/時鐘盤/日誌卡)/週。
 * Phase 2:真資料(todayStore)+ 事件表單 Sheet + 點空白新增 + 週長按進該日。
 */
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { BlocksView } from '../../components/today/blocks-view';
import { ClockView } from '../../components/today/clock-view';
import { DetectionToast } from '../../components/today/detection-toast';
import { EventSheet } from '../../components/today/event-sheet';
import { TimelineView } from '../../components/today/timeline-view';
import { WeekView } from '../../components/today/week-view';
import { Segmented } from '../../components/ui/segmented';
import { formatHeaderDate } from '../../i18n/format';
import { nowHours, type Event } from '../../domain/events';
import type { CategoryKey } from '../../domain/categories';
import { smartTick } from '../../services/smart-tick';
import { useTodayStore } from '../../state/todayStore';
import { useSettings } from '../../state/settings';
import { color, font, spacing } from '../../theme';

type DayWeek = 'day' | 'week';
type DayStyle = 'linear' | 'clock' | 'blocks';

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { date, events, weekEvents, routines, schedules, load, createEvent } = useTodayStore();
  const settings = useSettings((s) => s.settings);

  const [dayWeek, setDayWeek] = useState<DayWeek>('day');
  const [style, setStyle] = useState<DayStyle>('linear');
  const [selected, setSelected] = useState<Event | null>(null);
  const [creating, setCreating] = useState<{ start: number; end: number } | null>(null);
  const [detection, setDetection] = useState<{
    place: string; minutes: number; categoryGuess: CategoryKey;
    eventStart: number; eventEnd: number;
  } | null>(null);

  // Smart tick(Phase 4):排程到點 → 待確認事件 + 規則式預測(每 5 分鐘)
  useEffect(() => {
    const tick = () => {
      const hour = nowHours();
      const result = smartTick(date, hour, schedules, events, routines, weekEvents, {
        sensitivity: settings.sensitivity,
        sleepStart: settings.sleepStart,
        sleepEnd: settings.sleepEnd,
        flexEnabled: settings.flexEnabled,
        irregularMode: settings.irregularMode,
        leadTime: settings.leadTime,
      });
      result.scheduleEvents.forEach((e) => {
        void createEvent({
          start: e.start, end: e.end, category: e.category,
          label: e.label, predicted: true, source: 'predicted',
        });
      });
    };
    tick();
    const interval = setInterval(tick, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [date, schedules, events, routines, weekEvents, settings, createEvent]);

  const headerDate = formatHeaderDate(new Date(`${date}T00:00:00`), 'zh-TW');
  const closeSheet = () => {
    setSelected(null);
    setCreating(null);
  };

  // Phase 4 模擬:10 秒後觸發一次偵測 Toast 示範(native 由 expo-location 驅動)
  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = nowHours();
      if (hour > settings.sleepEnd && hour < settings.sleepStart) {
        setDetection({
          place: '示範地點 · 內湖辦公室',
          minutes: 45,
          categoryGuess: 'work',
          eventStart: Math.round((hour - 0.75) * 4) / 4,
          eventEnd: Math.round(hour * 4) / 4,
        });
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [settings.sleepStart, settings.sleepEnd]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{headerDate}</Text>
            <Text style={styles.title}>{t('today.title')}</Text>
          </View>
          <View style={styles.headerRight}>
            {/* 排程入口(§A1:28px 圓鈕) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('schedule.title')}
              onPress={() => router.push('/schedule')}
              style={styles.calendarBtn}
            >
              <Text style={styles.calendarIcon}>🗓</Text>
            </Pressable>
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
            {/* 三視圖永遠掛載、只切換 display——避免 RN-web 在多次 store
                更新後條件渲染(mount/unmount)不觸發 re-render 的已知問題。
                display:none 在 RN-native 與 RN-web 均支援。 */}
            <View style={styles.body}>
              <View style={[styles.viewSlot, style !== 'linear' && styles.viewHidden]}>
                <TimelineView
                  events={events}
                  onSelect={setSelected}
                  onCreate={(start) => setCreating({ start, end: start + 1 })}
                />
              </View>
              <View style={[styles.viewSlot, style !== 'clock' && styles.viewHidden]}>
                <ClockView events={events} />
              </View>
              <View style={[styles.viewSlot, style !== 'blocks' && styles.viewHidden]}>
                <BlocksView onSelect={setSelected} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.body} key="week-view">
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

      {/* 偵測通知(Phase 4 模擬:10 秒後觸發一次示範) */}
      <View style={styles.toastOverlay} pointerEvents={detection ? 'auto' : 'none'}>
        <DetectionToast
          detection={detection}
          onDismiss={() => setDetection(null)}
          onConfirm={(start, end, category, place) => {
            void createEvent({ start, end, category, label: place, source: 'detected' });
          }}
        />
      </View>
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calendarBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIcon: { fontSize: 14 },
  body: { gap: 12 },
  toastOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  viewSlot: { flex: 1 },
  viewHidden: { display: 'none' },
});
