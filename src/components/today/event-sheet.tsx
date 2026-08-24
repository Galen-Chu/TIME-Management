/**
 * 事件表單 Sheet(FR-EVT):
 * 確認模式(預測事件)/編輯模式(已確認);名稱輸入、類別膠囊、刪除:確認 1:2 雙按鈕。
 * 新增模式:時間軸點空白處建立的 manual 事件。
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CATEGORY_KEYS, type CategoryKey } from '../../domain/categories';
import { formatRange } from '../../i18n/format';
import type { Event } from '../../domain/events';
import { useTodayStore } from '../../state/todayStore';
import { color, font, radius } from '../../theme';
import { BottomSheet } from '../ui/bottom-sheet';
import { CategoryChip } from '../ui/category-chip';

interface Props {
  event: Event | null;
  creating: { start: number; end: number } | null;
  onClose: () => void;
}

export function EventSheet({ event, creating, onClose }: Props) {
  const { t } = useTranslation();
  const { updateEvent, confirmEvent, deleteEvent, createEvent } = useTodayStore();

  const isCreate = !event && creating != null;
  const isPredicted = event?.predicted ?? false;
  const title = isCreate
    ? t('sheet.createTitle')
    : isPredicted
      ? t('sheet.confirmTitle')
      : t('sheet.editTitle');

  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<CategoryKey>('other');

  useEffect(() => {
    if (event) {
      setLabel(event.label);
      setCategory(event.category);
    } else if (creating) {
      setLabel('');
      setCategory('other');
    }
  }, [event, creating]);

  const range = event
    ? formatRange(event.start, event.end)
    : creating
      ? formatRange(creating.start, creating.end)
      : '';

  const handleSave = async () => {
    if (isCreate && creating) {
      await createEvent({
        start: creating.start,
        end: creating.end,
        category,
        label: label.trim() || t(`categories.${category}`),
        source: 'manual',
      });
    } else if (event) {
      if (isPredicted) {
        await updateEvent(event.id, { label: label.trim() || event.label, category });
        await confirmEvent(event.id);
      } else {
        await updateEvent(event.id, { label: label.trim() || event.label, category });
      }
    }
    onClose();
  };

  const handleDelete = async () => {
    if (event) await deleteEvent(event.id);
    onClose();
  };

  return (
    <BottomSheet visible={event != null || creating != null} onClose={onClose}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.range}>{range}</Text>

        <Text style={styles.fieldLabel}>{t('sheet.nameLabel')}</Text>
        <TextInput
          accessibilityLabel={t('sheet.nameLabel')}
          value={label}
          onChangeText={setLabel}
          placeholder={t('sheet.namePlaceholder')}
          placeholderTextColor={color.inkMuted}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>{t('sheet.categoryField')}</Text>
        <View style={styles.chips}>
          {CATEGORY_KEYS.map((k) => (
            <CategoryChip
              key={k}
              category={k}
              selected={category === k}
              onPress={setCategory}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {event && (
            <Pressable accessibilityRole="button" style={[styles.btn, styles.btnSecondary]} onPress={handleDelete}>
              <Text style={styles.btnSecondaryText}>{t('common.delete')}</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" style={[styles.btn, styles.btnPrimary, event && { flex: 2 }]} onPress={handleSave}>
            <Text style={styles.btnPrimaryText}>
              {isPredicted ? t('common.confirm') : t('common.save')}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 8, gap: 10 },
  title: { fontSize: 20, fontFamily: font.rounded.semibold, color: color.ink },
  range: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium, fontVariant: ['tabular-nums'] },
  fieldLabel: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium, marginTop: 6 },
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
  actions: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 8 },
  btn: {
    flex: 1,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: color.ink },
  btnPrimaryText: { color: color.bg, fontFamily: font.rounded.bold, fontSize: 15 },
  btnSecondary: { backgroundColor: color.track },
  btnSecondaryText: { color: color.inkSecondary, fontFamily: font.rounded.semibold, fontSize: 15 },
});
