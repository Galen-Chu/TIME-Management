/**
 * 彈性調節分頁(FR-ADJ):睡眠時間步進器(±0.25 環繞)+ 兩開關。
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card } from '../../components/ui/card';
import { Stepper } from '../../components/ui/stepper';
import { Toggle } from '../../components/ui/toggle';
import { formatClock } from '../../i18n/format';
import { useSettings, wrapSleep } from '../../state/settings';
import { color, font } from '../../theme';

export default function AdjustScreen() {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('adjust.title')}</Text>

        {/* 睡眠時間 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('adjust.sleep')}</Text>
          <Text style={styles.cardDesc}>{t('adjust.sleepDesc')}</Text>
          <View style={styles.sleepRow}>
            <View style={styles.sleepCol}>
              <Text style={styles.sleepLabel}>{t('adjust.bedtime')}</Text>
              <Stepper
                value={formatClock(settings.sleepStart)}
                onDecrement={() => update({ sleepStart: wrapSleep(settings.sleepStart - 0.25) })}
                onIncrement={() => update({ sleepStart: wrapSleep(settings.sleepStart + 0.25) })}
              />
            </View>
            <View style={styles.sleepCol}>
              <Text style={styles.sleepLabel}>{t('adjust.wake')}</Text>
              <Stepper
                value={formatClock(settings.sleepEnd)}
                onDecrement={() => update({ sleepEnd: wrapSleep(settings.sleepEnd - 0.25) })}
                onIncrement={() => update({ sleepEnd: wrapSleep(settings.sleepEnd + 0.25) })}
              />
            </View>
          </View>
        </Card>

        {/* 彈性作息 */}
        <Card style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.cardTitle}>{t('adjust.flex')}</Text>
              <Text style={styles.cardDesc}>{t('adjust.flexDesc')}</Text>
            </View>
            <Toggle
              accessibilityLabel={t('adjust.flex')}
              value={settings.flexEnabled}
              onChange={(v) => update({ flexEnabled: v })}
            />
          </View>
        </Card>

        {/* 非規律模式 */}
        <Card style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.cardTitle}>{t('adjust.irregular')}</Text>
              <Text style={styles.cardDesc}>{t('adjust.irregularDesc')}</Text>
            </View>
            <Toggle
              accessibilityLabel={t('adjust.irregular')}
              value={settings.irregularMode}
              onChange={(v) => update({ irregularMode: v })}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  title: { fontSize: 32, fontFamily: font.rounded.semibold, color: color.ink, marginBottom: 4 },
  card: { gap: 8 },
  cardTitle: { fontSize: 15, fontFamily: font.rounded.semibold, color: color.ink },
  cardDesc: { fontSize: 13, color: color.inkSecondary, fontFamily: font.rounded.medium, lineHeight: 19 },
  sleepRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  sleepCol: { flex: 1, gap: 8 },
  sleepLabel: { fontSize: 12, color: color.inkMuted, fontFamily: font.rounded.medium },
  switchCard: {},
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchText: { flex: 1, gap: 4 },
});
