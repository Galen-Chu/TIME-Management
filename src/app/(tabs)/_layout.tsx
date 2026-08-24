/**
 * 四分頁導覽(DESIGN-SPEC Tab Bar):
 * 白底 90% 透明 + 上緣 1px divider;每分頁 = 7px 圓點(作用 accent/否則透明)
 * + 11px 標籤(作用 ink/否則 inkMuted)。i18n key:tabs.*。
 * 導覽走導覽器自身 navigation.navigate(含 tabPress 事件),確保狀態同步。
 */
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { color, font } from '../../theme';

const TABS: { name: string; key: string }[] = [
  { name: 'index', key: 'tabs.today' },
  { name: 'stats', key: 'tabs.stats' },
  { name: 'adjust', key: 'tabs.adjust' },
  { name: 'settings', key: 'tabs.settings' },
];

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => (
        <View style={styles.bar}>
          {TABS.map((tab, i) => {
            const active = props.state.index === i;
            return (
              <Pressable
                key={tab.name}
                onPress={() => {
                  const event = props.navigation.emit({
                    type: 'tabPress',
                    target: props.state.routes[i].key,
                    canPreventDefault: true,
                  });
                  if (!event.defaultPrevented) {
                    props.navigation.navigate(tab.name);
                  }
                }}
                style={styles.tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <View style={[styles.dot, active && styles.dotActive]} />
                <Text style={[styles.label, active && styles.labelActive]}>
                  {t(tab.key)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="adjust" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 5 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  dotActive: { backgroundColor: color.accent },
  label: {
    fontSize: 11,
    fontFamily: font.rounded.semibold,
    color: color.inkMuted,
  },
  labelActive: { color: color.ink },
});
