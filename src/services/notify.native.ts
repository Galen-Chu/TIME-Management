/**
 * 通知派發連接埠——native 實作(expo-notifications)。
 * - gentle → App 內卡片(由 UI 層呈現)
 * - push → 系統本地通知;權限未授予時降級 App 內卡片
 * - 免打擾與 leadTime 判定已在 notification.ts 純函式完成,本檔只負責派發
 */
import * as Notifications from 'expo-notifications';

import type { InAppCard, NotifyPort } from './notify';

let pushAvailable = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export const notify: NotifyPort = {
  async init() {
    pushAvailable = await ensurePermission();
    return pushAvailable;
  },

  async dispatchReminder(action, t): Promise<InAppCard | null> {
    if (action.type === 'none') return null;
    if (action.type === 'in-app-card') {
      return { eventId: action.eventId, titleKey: action.titleKey, bodyParams: action.bodyParams };
    }
    if (pushAvailable) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t(action.titleKey),
          body: t('notify.push.body', action.bodyParams as unknown as Record<string, unknown>),
        },
        trigger: null, // 立即(tick 已依 leadTime 判定時機)
      });
      return null;
    }
    // 權限未授予:降級 App 內卡片
    return { eventId: action.eventId, titleKey: action.titleKey, bodyParams: action.bodyParams };
  },

  async presentDetection(title, body) {
    if (!pushAvailable) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    return true;
  },
};
