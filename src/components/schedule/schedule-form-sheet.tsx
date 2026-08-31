/**
 * 排程表單(§A3):標題、類別膠囊、重複四選一、星期多選(僅每週/每兩週)、
 * 時間步進器(0.25h)、時長步進器(0.5–4)、提醒開關;刪除:儲存 1:2。
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '../ui/bottom-sheet';
import { CategoryChip } from '../ui/category-chip';
import { Segmented } from '../ui/segmented';
import { Stepper } from '../ui/stepper';
import { Toggle } from '../ui/toggle';
import { CATEGORY_KEYS, type CategoryKey } from '../../domain/categories';
import { formatClock } from '../../i18n/format';
import { clampDuration } from '../../domain/schedule';
import { wrapSleep } from '../../domain/invariants';
import { useTodayStore } from '../../state/todayStore';
import type { ScheduleItem, Recurrence } from '../../data/schedule-types';
import { uid } from '../../utils/uid';
import { color, font, radius } from '../../theme';

interface Props {
  item: ScheduleItem | null;
  creating: boolean;
  onClose: () => void;
}

function newSchedule(): ScheduleItem {
  return {
    id: '',
    title: '',
    category: 'work',
    recurrence: 'weekly',
    weekdays: [1],
    time: 9,
    durationH: 1,
    reminderOn: true,
  };
}

export function ScheduleFormSheet({ item, creating, onClose }: Props) {
  const { t } = useTranslation();
  const { saveSchedule, deleteSchedule, date } = useTodayStore();
  const [draft, setDraft] = useState<ScheduleItem>(newSchedule());

  useEffect(() => {
    if (item) setDraft({ ...item });
    else if (creating) setDraft({ ...newSchedule(), date });
  }, [item, creating, date]);

  const visible = item != null || creating;
  const showWeekdays = draft.recurrence === 'weekly' || draft.recurrence === 'biweekly';
  const showDate = draft.recurrence === 'once';

  const toggleWeekday = (w: number) => {
    setDraft((d) => ({
      ...d,
      weekdays: d.weekdays.includes(w)
        ? d.weekdays.filter((x) => x !== w)
        : [...d.weekdays, w],
    }));
  };

  const handleSave = async () => {
    const id = draft.id || uid('s');
    const weekdaySorted = showWeekdays ? [...draft.weekdays].sort() : [];
    if (draft.recurrence === 'weekly' && weekdaySorted.length === 0) return; // 至少選一日
    await saveSchedule({
      ...draft,
      id,
      title: draft.title.trim() || t('schedule.title'),
      weekdays: weekdaySorted,
      date: showDate ? draft.date : undefined,
    });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.wrap}>
        <Text style={styles.sheetTitle}>
          {item ? t('schedule.edit') : t('schedule.addSchedule')}
        </Text>

        <Text style={styles.fieldLabel}>{t('schedule.titleField')}</Text>
        <TextInput
          accessibilityLabel={t('schedule.titleField')}
          value={draft.title}
          onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>{t('schedule.category')}</Text>
        <View style={styles.chips}>
          {CATEGORY_KEYS.map((k) => (
            <CategoryChip
              key={k}
              category={k}
              selected={draft.category === k}
              onPress={(c: CategoryKey) => setDraft((d) => ({ ...d, category: c }))}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>{t('schedule.repeatLabel')}</Text>
        <Segmented
          value={draft.recurrence}
          onChange={(v: Recurrence) => setDraft((d) => ({ ...d, recurrence: v }))}
          options={[
            { value: 'daily', label: t('schedule.recurrence.daily') },
            { value: 'weekly', label: t('schedule.recurrence.weekly') },
            { value: 'biweekly', label: t('schedule.recurrence.biweekly') },
            { value: 'once', label: t('schedule.recurrence.once') },
          ]}
        />

        {showWeekdays && (
          <View style={styles.weekdays}>
            {[1, 2, 3, 4, 5, 6, 7].map((w) => {
              const on = draft.weekdays.includes(w);
              return (
                <Pressable
                  key={w}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => toggleWeekday(w)}
                  style={[styles.wdChip, on && styles.wdChipOn]}
                >
                  <Text style={[styles.wdText, on && styles.wdTextOn]}>
                    {t(`schedule.weekday.${w}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.row2}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>{t('schedule.time')}</Text>
            <Stepper
              value={formatClock(draft.time)}
              onDecrement={() => setDraft((d) => ({ ...d, time: wrapSleep(d.time - 0.25) }))}
              onIncrement={() => setDraft((d) => ({ ...d, time: wrapSleep(d.time + 0.25) }))}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>{t('schedule.duration')}</Text>
            <Stepper
              value={`${draft.durationH}h`}
              onDecrement={() => setDraft((d) => ({ ...d, durationH: clampDuration(d.durationH - 0.5) }))}
              onIncrement={() => setDraft((d) => ({ ...d, durationH: clampDuration(d.durationH + 0.5) }))}
            />
          </View>
        </View>

        <View style={styles.reminderRow}>
          <Text style={styles.fieldLabel}>{t('schedule.reminder')}</Text>
          <Toggle
            accessibilityLabel={t('schedule.reminder')}
            value={draft.reminderOn}
            onChange={(v) => setDraft((d) => ({ ...d, reminderOn: v }))}
          />
        </View>

        <View style={styles.actions}>
          {item && (
            <Pressable
              accessibilityRole="button"
              style={[styles.btn, styles.btnSecondary]}
              onPress={async () => {
                await deleteSchedule(item.id);
                onClose();
              }}
            >
              <Text style={styles.btnSecondaryText}>{t('common.delete')}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            style={[styles.btn, styles.btnPrimary, item && { flex: 2 }]}
            onPress={handleSave}
          >
            <Text style={styles.btnPrimaryText}>{t('common.save')}</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 8, gap: 10 },
  sheetTitle: { fontSize: 20, fontFamily: font.rounded.semibold, color: color.ink },
  fieldLabel: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: color.divider,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: font.rounded.medium,
    color: color.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  weekdays: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  wdChip: {
    borderWidth: 1.5,
    borderColor: color.trackAlt,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  wdChipOn: { borderColor: color.ink, backgroundColor: color.ink },
  wdText: { fontSize: 12, color: color.inkSecondary, fontFamily: font.rounded.medium },
  wdTextOn: { color: color.bg, fontFamily: font.rounded.bold },
  row2: { flexDirection: 'row', gap: 16 },
  col: { flex: 1, gap: 6 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 8 },
  btn: { flex: 1, borderRadius: radius.button, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: color.ink },
  btnPrimaryText: { color: color.bg, fontFamily: font.rounded.bold, fontSize: 15 },
  btnSecondary: { backgroundColor: color.track },
  btnSecondaryText: { color: color.inkSecondary, fontFamily: font.rounded.semibold, fontSize: 15 },
});
