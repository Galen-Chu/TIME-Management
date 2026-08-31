/**
 * 通知派發連接埠測試(jest-expo 解析 native 變體;expo-notifications 已 mock
 * 為「權限未授予」→ push 降級 App 內卡片,與 web 行為一致)。
 * 真機的系統推播呈現由 dev client 階段驗證。
 */
import { notify } from '../notify';
import type { NotifyAction } from '../notification';

const t = (key: string) => key; // 測試僅驗傳遞,不驗翻譯

describe('notify 連接埠(權限未授予=降級)', () => {
  it('init 回傳 false(系統推播不可用)', async () => {
    expect(await notify.init()).toBe(false);
  });

  it('push 降級為 App 內卡片(保留事件 id 與文案參數)', async () => {
    const action: NotifyAction = {
      type: 'push',
      eventId: 'e1',
      titleKey: 'notify.push.upcomingTitle',
      bodyParams: { label: '晨間瑜伽', minutes: 10 },
    };
    const card = await notify.dispatchReminder(action, t);
    expect(card).toEqual({
      eventId: 'e1',
      titleKey: 'notify.push.upcomingTitle',
      bodyParams: { label: '晨間瑜伽', minutes: 10 },
    });
  });

  it('in-app-card 直接回卡片;none → null', async () => {
    const gentle: NotifyAction = {
      type: 'in-app-card',
      eventId: 'e2',
      titleKey: 'notify.push.predictedTitle',
      bodyParams: { label: '推測工作', minutes: 5 },
    };
    expect(await notify.dispatchReminder(gentle, t)).toMatchObject({ eventId: 'e2' });
    expect(await notify.dispatchReminder({ type: 'none', reason: 'not-due' }, t)).toBeNull();
  });

  it('presentDetection 回傳 false(推播不可用)', async () => {
    expect(await notify.presentDetection('標題', '內容')).toBe(false);
  });
});
