/**
 * Root layout:字體載入、i18n 同步、全域底色。
 */
import {
  Karla_400Regular,
  Karla_500Medium,
  Karla_600SemiBold,
  Karla_700Bold,
  useFonts,
} from '@expo-google-fonts/karla';
import {
  MPLUSRounded1c_500Medium,
  MPLUSRounded1c_700Bold,
} from '@expo-google-fonts/m-plus-rounded-1c';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '../i18n';
import { useSettings } from '../state/settings';
import { color } from '../theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useSettings.persist.hasHydrated();
  const language = useSettings((s) => s.settings.language);

  const [fontsLoaded] = useFonts({
    'MPLUSRounded1c-Medium': MPLUSRounded1c_500Medium,
    'MPLUSRounded1c-Bold': MPLUSRounded1c_700Bold,
    'Karla-Regular': Karla_400Regular,
    'Karla-Medium': Karla_500Medium,
    'Karla-SemiBold': Karla_600SemiBold,
    'Karla-Bold': Karla_700Bold,
  });

  // 持久化載入後依設定同步語言(onRehydrateStorage 亦處理,此為雙保險)
  useEffect(() => {
    if (hydrated && language) void i18n.changeLanguage(language);
  }, [hydrated, language]);

  useEffect(() => {
    if (fontsLoaded && hydrated) void SplashScreen.hideAsync();
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) return null;

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
});
