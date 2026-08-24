/**
 * 今天分頁(FR-TOD):標題區(日期+大標+日/週分段)→
 * 日檢視(時間軸/時鐘盤/日誌卡三呈現)或週檢視。Phase 1 虛擬資料。
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { BlocksView } from '../../components/today/blocks-view';
import { ClockView } from '../../components/today/clock-view';
import { TimelineView } from '../../components/today/timeline-view';
import { WeekView } from '../../components/today/week-view';
import { Segmented } from '../../components/ui/segmented';
import { formatHeaderDate } from '../../i18n/format';
import { MOCK_DATE, mockEvents } from '../../mock/today';
import { currentLanguage, useSettings } from '../../state/settings';
import { color, font, spacing } from '../../theme';

type DayWeek = 'day' | 'week';
type DayStyle = 'linear' | 'clock' | 'blocks';

export default function TodayScreen() {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);
  const [dayWeek, setDayWeek] = useState<DayWeek>('day');
  const [style, setStyle] = useState<DayStyle>('linear');

  const headerDate = formatHeaderDate(new Date(`${MOCK_DATE}T00:00:00`), lang);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 標題區 */}
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
              {style === 'linear' && <TimelineView events={mockEvents} />}
              {style === 'clock' && <ClockView events={mockEvents} />}
              {style === 'blocks' && <BlocksView />}
            </View>
          </>
        ) : (
          <View style={styles.body}>
            <WeekView />
          </View>
        )}
      </ScrollView>
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
