/**
 * 今天分頁(FR-TOD):標題區 → 日(時間軸/時鐘盤/日誌卡)/週。
 * Phase 2:真資料(todayStore)+ 事件表單 Sheet + 點空白新增 + 週長按進該日。
 */
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { BlocksView } from '../../components/today/blocks-view';
import { ClockView } from '../../components/today/clock-view';
import { DetectionToast } from '../../components/today/detection-toast';
import { EventSheet } from '../../components/today/event-sheet';
import { ReminderToast } from '../../components/today/reminder-toast';
import { TimelineView } from '../../components/today/timeline-view';
import { WeekView } from '../../components/today/week-view';
import { Segmented } from '../../components/ui/segmented';
import { formatHeaderDate } from '../../i18n/format';
import { nowHours, snap, type Event } from '../../domain/events';
import type { CategoryKey } from '../../domain/categories';
import { smartTick } from '../../services/smart-tick';
import { checkEventReminder } from '../../services/notification';
import { dwellToSuggestion } from '../../services/detection';
import { locationService } from '../../services/location';
import { notify, type InAppCard } from '../../services/notify';
import { useNow } from '../../hooks/use-now';
import { useTodayStore } from '../../state/todayStore';
import { currentLanguage, useSettings } from '../../state/settings';
import { color, font, spacing } from '../../theme';

type DayWeek = 'day' | 'week';
type DayStyle = 'linear' | 'clock' | 'blocks';

const TICK_INTERVAL_MS = 5 * 60 * 1000; // smartTick 週期(ARCHITECTURE)
const DEMO_DETECTION_DELAY_MS = 10_000; // Phase 4 偵測示範:掛載後 10 秒
const DEFAULT_EVENT_DURATION_H = 1; // 點空白新增的預設時長

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { date, events, weekEvents, routines, schedules, load, createEvent, applyPredictedEvents } = useTodayStore();
  const settings = useSettings((s) => s.settings);
  const now = useNow(); // 驅動現在線/時鐘指針的即時時刻

  const [dayWeek, setDayWeek] = useState<DayWeek>('day');
  const [style, setStyle] = useState<DayStyle>('linear');
  const [selected, setSelected] = useState<Event | null>(null);
  const [creating, setCreating] = useState<{ start: number; end: number } | null>(null);
  const [detection, setDetection] = useState<{
    place: string; minutes: number; categoryGuess: CategoryKey;
    eventStart: number; eventEnd: number;
  } | null>(null);
  const [reminder, setReminder] = useState<InAppCard | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set()); // 每事件每 session 僅提醒一次

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
      // 排程到點 + 規則式預測一併落地為待確認事件(applyPredictedEvents 冪等:
      // 保留 smartTick 的確定性 id,已存在/重疊者略過)
      void applyPredictedEvents([...result.scheduleEvents, ...result.predictions]);

      // 提醒(FR-SET):leadTime 內將開始的事件,依通知風格派發(每事件每 session 一次)
      events.forEach((e) => {
        const action = checkEventReminder({
          event: e,
          currentHour: hour,
          leadTime: settings.leadTime,
          notifyStyle: settings.notifyStyle,
          quietHoursOn: settings.quietHoursOn,
        });
        if (action.type === 'none' || notifiedRef.current.has(e.id)) return;
        notifiedRef.current.add(e.id);
        void notify.dispatchReminder(action, t).then((card) => {
          if (card) setReminder(card);
        });
      });
    };
    tick();
    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [date, schedules, events, routines, weekEvents, settings, applyPredictedEvents, t]);

  const headerDate = formatHeaderDate(new Date(`${date}T00:00:00`), currentLanguage(settings));
  const closeSheet = () => {
    setSelected(null);
    setCreating(null);
  };

  // 偵測(FR-DTC):native 走 expo-location 前景停留判定;web 維持示範模式
  useEffect(() => {
    if (Platform.OS === 'web') {
      const timer = setTimeout(() => {
        const hour = nowHours();
        if (hour > settings.sleepEnd && hour < settings.sleepStart) {
          setDetection({
            place: t('today.demoPlace'),
            minutes: 45,
            categoryGuess: 'work',
            eventStart: snap(hour - 0.75),
            eventEnd: snap(hour),
          });
        }
      }, DEMO_DETECTION_DELAY_MS);
      return () => clearTimeout(timer);
    }

    let active = true;
    void locationService.start({
      onDwell: (c) => {
        if (!active) return;
        const hour = nowHours();
        if (hour <= settings.sleepEnd || hour >= settings.sleepStart) return; // 睡眠時段不出卡
        const s = dwellToSuggestion(c);
        setDetection({
          place: c.placeName,
          minutes: c.minutes,
          categoryGuess: c.categoryGuess,
          eventStart: s.eventStart,
          eventEnd: s.eventEnd,
        });
        if (settings.notifyStyle === 'push') {
          void notify.presentDetection(
            t('notify.detectTitle'),
            t('toast.detect', {
              place: c.placeName || t('toast.unknownPlace'),
              minutes: c.minutes,
              activity: t(`categories.${c.categoryGuess}`),
            })
          );
        }
      },
    });
    return () => {
      active = false;
      locationService.stop();
    };
  }, [t, settings.sleepStart, settings.sleepEnd, settings.notifyStyle]);

  // 通知初始化(native:handler 與權限;web no-op)
  useEffect(() => {
    void notify.init();
  }, []);

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
                  now={now}
                  onSelect={setSelected}
                  onCreate={(start) => setCreating({ start, end: start + DEFAULT_EVENT_DURATION_H })}
                />
              </View>
              <View style={[styles.viewSlot, style !== 'clock' && styles.viewHidden]}>
                <ClockView events={events} now={now} />
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

      {/* 偵測通知 + 溫和提醒卡(頂部疊層) */}
      <View style={styles.toastOverlay} pointerEvents={detection || reminder ? 'auto' : 'none'}>
        <View style={styles.toastStack}>
          <DetectionToast
            detection={detection}
            onDismiss={() => setDetection(null)}
            onConfirm={(start, end, category, place) => {
              void createEvent({
                start, end, category,
                label: place || t('categories.other'),
                source: 'detected',
              });
            }}
          />
          <ReminderToast
            card={reminder}
            onView={(eventId) => {
              const e = events.find((x) => x.id === eventId);
              if (e) setSelected(e);
            }}
            onDismiss={() => setReminder(null)}
          />
        </View>
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
  toastStack: { gap: 8 },
  viewSlot: { flex: 1 },
  viewHidden: { display: 'none' },
});
