/* Jest 全域設定:
   - AsyncStorage 官方 mock(zustand persist 於 Node/jsdom 環境需要)
   - expo-notifications / expo-location 平台模組 mock(jest-expo 將 .native.ts
     解析為當前平台;模擬「權限未授予」→ 通知降級 App 內卡片,與 web 行為一致) */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: false })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
  scheduleNotificationAsync: jest.fn(async () => ({})),
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  watchPositionAsync: jest.fn(async () => ({ remove: jest.fn() })),
  reverseGeocodeAsync: jest.fn(async () => []),
  Accuracy: { Balanced: 4 },
}));
