/**
 * 全域錯誤邊界(P1):攔截渲染期例外,顯示雙語 fallback 與「重試」
 * (重試=重設邊界狀態、重新渲染子樹)。僅在裝置端處理,不上傳任何資訊。
 */
import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { color, font, radius } from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

function Fallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('common.error')}</Text>
      <Text style={styles.body}>{t('common.errorBoundaryBody')}</Text>
      <Pressable accessibilityRole="button" style={styles.btn} onPress={onRetry}>
        <Text style={styles.btnText}>{t('common.retry')}</Text>
      </Pressable>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <Fallback onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    backgroundColor: color.bg,
  },
  title: { fontSize: 20, fontFamily: font.rounded.semibold, color: color.ink },
  body: {
    fontSize: 13,
    fontFamily: font.rounded.medium,
    color: color.inkSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  btn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: radius.pill,
    backgroundColor: color.ink,
  },
  btnText: { fontSize: 14, fontFamily: font.rounded.bold, color: color.bg },
});
