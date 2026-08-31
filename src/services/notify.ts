/**
 * 通知派發連接埠——web 實作。
 * web 無系統推播:push 一律降級為 App 內卡片(FR-SET 溫和卡片=App 內呈現的精神)。
 * native 實作見 notify.native.ts(expo-notifications);介面兩端對稱。
 */
import type { NotifyAction } from './notification';

/** App 內提醒卡片的內容(呈現端以 t() 解析;NFR-6) */
export interface InAppCard {
  eventId: string;
  titleKey: 'notify.push.predictedTitle' | 'notify.push.upcomingTitle';
  bodyParams: { label: string; minutes: number };
}

/** i18n 翻譯函式注入(服務層不直接依賴 i18n 單例) */
export type TFunc = (key: string, params?: Record<string, unknown>) => string;

export interface NotifyPort {
  /** 初始化(native:通知 handler 與權限);回傳系統推播是否可用 */
  init: () => Promise<boolean>;
  /**
   * 派發提醒動作。
   * 回傳 InAppCard = 應顯示 App 內卡片(push 已發出或無需卡片時回傳 null)。
   */
  dispatchReminder: (action: NotifyAction, t: TFunc) => Promise<InAppCard | null>;
  /** 偵測情境的系統推播(僅 notifyStyle='push';FR-DTC);回傳是否已發出 */
  presentDetection: (title: string, body: string) => Promise<boolean>;
}

export const notify: NotifyPort = {
  async init() {
    return false; // web:無系統推播
  },
  async dispatchReminder(action) {
    if (action.type === 'in-app-card' || action.type === 'push') {
      return { eventId: action.eventId, titleKey: action.titleKey, bodyParams: action.bodyParams };
    }
    return null;
  },
  async presentDetection() {
    return false;
  },
};
