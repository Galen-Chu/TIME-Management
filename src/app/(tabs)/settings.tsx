/**
 * AI 預測與提醒分頁(FR-SET)+ 語言切換列(ADDENDUM §C,即時生效)。
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card } from '../../components/ui/card';
import { Segmented } from '../../components/ui/segmented';
import { Stepper } from '../../components/ui/stepper';
import { Toggle } from '../../components/ui/toggle';
import { clampLeadTime, useSettings } from '../../state/settings';
import { color, font } from '../../theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, update, setLanguage } = useSettings();
  const sensDescKey = `settings.sens${settings.sensitivity}Desc` as const;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* 預測敏感度 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.sensitivity')}</Text>
          <Segmented
            accessibilityLabel={t('settings.sensitivity')}
            value={String(settings.sensitivity)}
            onChange={(v) => update({ sensitivity: Number(v) as 0 | 1 | 2 })}
            options={[
              { value: '0', label: t('settings.sens0') },
              { value: '1', label: t('settings.sens1') },
              { value: '2', label: t('settings.sens2') },
            ]}
          />
          <Text style={styles.cardDesc}>{t(sensDescKey)}</Text>
        </Card>

        {/* 提醒提前時間 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.leadTime')}</Text>
          <Text style={styles.cardDesc}>{t('settings.leadTimeDesc')}</Text>
          <View style={styles.center}>
            <Stepper
              value={t('settings.leadTimeValue', { n: settings.leadTime })}
              onDecrement={() => update({ leadTime: clampLeadTime(settings.leadTime - 5) })}
              onIncrement={() => update({ leadTime: clampLeadTime(settings.leadTime + 5) })}
            />
          </View>
        </Card>

        {/* 通知風格 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.notify')}</Text>
          <Segmented
            accessibilityLabel={t('settings.notify')}
            value={settings.notifyStyle}
            onChange={(v) => update({ notifyStyle: v })}
            options={[
              { value: 'gentle', label: t('settings.notifyGentle') },
              { value: 'push', label: t('settings.notifyPush') },
            ]}
          />
        </Card>

        {/* 免打擾時段 */}
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.cardTitle}>{t('settings.quiet')}</Text>
              <Text style={styles.cardDesc}>{t('settings.quietDesc')}</Text>
            </View>
            <Toggle
              accessibilityLabel={t('settings.quiet')}
              value={settings.quietHoursOn}
              onChange={(v) => update({ quietHoursOn: v })}
            />
          </View>
        </Card>

        {/* 語言切換列(ADDENDUM §C:雙語並列、即時生效) */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.language')}</Text>
          <Text style={styles.cardDesc}>{t('settings.languageDesc')}</Text>
          <Segmented
            accessibilityLabel={t('settings.language')}
            value={settings.language ?? 'zh-TW'}
            onChange={(v) => setLanguage(v)}
            options={[
              { value: 'zh-TW', label: t('settings.langZhTW') },
              { value: 'en-US', label: t('settings.langEn') },
            ]}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  title: { fontSize: 32, fontFamily: font.rounded.semibold, color: color.ink, marginBottom: 4 },
  card: { gap: 10 },
  cardTitle: { fontSize: 15, fontFamily: font.rounded.semibold, color: color.ink },
  cardDesc: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium, lineHeight: 19 },
  center: { alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchText: { flex: 1, gap: 4 },
});
