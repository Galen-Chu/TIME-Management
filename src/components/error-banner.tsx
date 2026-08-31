/**
 * 資料錯誤橫幅(P1):todayStore.error 有值時於頂部顯示通用文案(附技術細節),
 * 關閉鈕清除。非阻斷——App 保持可用;渲染期例外另走 ErrorBoundary。
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTodayStore } from '../state/todayStore';
import { color, font, radius } from '../theme';

export function ErrorBanner() {
  const { t } = useTranslation();
  const error = useTodayStore((s) => s.error);
  const clearError = useTodayStore((s) => s.clearError);

  if (!error) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.main}>
        <Text style={styles.title}>{t('common.errorSave')}</Text>
        <Text style={styles.detail} numberOfLines={2}>
          {error}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={clearError}
        hitSlop={8}
      >
        <Text style={styles.close}>{t('common.close')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: color.accent,
    borderRadius: radius.row,
  },
  main: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontFamily: font.rounded.semibold, color: color.ink },
  detail: {
    fontSize: 11,
    fontFamily: font.rounded.medium,
    color: color.inkSecondary,
  },
  close: { fontSize: 12, fontFamily: font.rounded.bold, color: color.accent },
});
