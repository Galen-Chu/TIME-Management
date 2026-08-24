/**
 * Onboarding 三步全畫面引導(FR-ONB):
 * 有機漸層色塊(150px)、標題、說明、膠囊進度點(作用中 22px 轉 accent)、
 * 右下「跳過」、底部主按鈕(步驟 1–2 繼續/步驟 3 開始使用)。
 */
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useSettings } from '../state/settings';
import { color, font } from '../theme';

const STEPS = [
  { key: 's1', from: '#F2B79A', to: '#E2795A' },
  { key: 's2', from: '#B9C7B0', to: '#7C9473' },
  { key: 's3', from: '#DCB98A', to: '#D9A441' },
] as const;

export default function Onboarding() {
  const { t } = useTranslation();
  const router = useRouter();
  const finishOnboarding = useSettings((s) => s.finishOnboarding);
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  /** 完成或跳過:記住 onboardingDone 並進入主畫面(FR-ONB) */
  const finish = () => {
    finishOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable
        accessibilityRole="button"
        style={styles.skip}
        onPress={finish}
      >
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </Pressable>

      <View style={styles.body}>
        <LinearGradient
          colors={[STEPS[step].from, STEPS[step].to]}
          style={styles.blob}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
        />
        <Text style={styles.title}>{t(`onboarding.${STEPS[step].key}.title`)}</Text>
        <Text style={styles.desc}>{t(`onboarding.${STEPS[step].key}.body`)}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityRole="progressbar">
          {STEPS.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.cta}
          onPress={() => (last ? finish() : setStep(step + 1))}
        >
          <Text style={styles.ctaText}>{t(last ? 'common.start' : 'common.next')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  skip: { alignSelf: 'flex-end', padding: 16 },
  skipText: { color: color.inkMuted, fontSize: 14, fontFamily: font.rounded.medium },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  blob: {
    width: 150,
    height: 150,
    // 有機形:不對稱圓角
    borderRadius: 75,
    borderTopLeftRadius: 95,
    borderBottomRightRadius: 55,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontFamily: font.rounded.semibold,
    color: color.ink,
    textAlign: 'center',
    lineHeight: 32,
  },
  desc: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: font.rounded.medium,
    color: color.inkSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 32, paddingBottom: 24, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.trackAlt,
  },
  dotActive: {
    width: 22,
    backgroundColor: color.accent,
  },
  cta: {
    backgroundColor: color.ink,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: color.bg, fontSize: 16, fontFamily: font.rounded.bold },
});
