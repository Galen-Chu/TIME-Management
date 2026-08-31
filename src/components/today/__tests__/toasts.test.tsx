/**
 * 偵測 Toast 與溫和提醒卡測試(P3):文案組字與動作回呼。
 */
import { act, fireEvent, render } from '@testing-library/react-native';

import i18n from '../../../i18n'; // 初始化 i18next(元件文案走 zh-TW 預設)
import type { InAppCard } from '../../../services/notify';
import { DetectionToast } from '../detection-toast';
import { ReminderToast } from '../reminder-toast';

void i18n;

const DETECTION = {
  place: '內湖辦公室',
  minutes: 45,
  categoryGuess: 'work' as const,
  eventStart: 9.25,
  eventEnd: 10,
};

describe('DetectionToast(FR-DTC)', () => {
  it('文案含地點/分鐘/活動;「查看並確認」回呼建議時間與類別', async () => {
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();
    const { getByText, getByRole } = await render(
      <DetectionToast detection={DETECTION} onDismiss={onDismiss} onConfirm={onConfirm} />
    );

    expect(getByText(/內湖辦公室/)).toBeTruthy();
    expect(getByText(/45 分鐘/)).toBeTruthy();
    expect(getByText(/工作/)).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '查看並確認' }));
    });
    expect(onConfirm).toHaveBeenCalledWith(9.25, 10, 'work', '內湖辦公室');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('detection=null → 不渲染', async () => {
    const { toJSON } = await render(
      <DetectionToast detection={null} onDismiss={jest.fn()} onConfirm={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('地點空字串 → 顯示 fallback「未命名地點」', async () => {
    const { getByText } = await render(
      <DetectionToast
        detection={{ ...DETECTION, place: '' }}
        onDismiss={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    expect(getByText(/未命名地點/)).toBeTruthy();
  });
});

describe('ReminderToast(FR-SET 溫和卡片)', () => {
  const card: InAppCard = {
    eventId: 'e1',
    titleKey: 'notify.push.upcomingTitle',
    bodyParams: { label: '晨間瑜伽', minutes: 10 },
  };

  it('文案 = 標題 key + 事件/分鐘;「查看並確認」回呼事件 id', async () => {
    const onView = jest.fn();
    const { getByText, getByRole } = await render(
      <ReminderToast card={card} onView={onView} onDismiss={jest.fn()} />
    );

    expect(getByText(/即將開始/)).toBeTruthy();
    expect(getByText(/晨間瑜伽/)).toBeTruthy();
    expect(getByText(/10 分鐘/)).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '查看並確認' }));
    });
    expect(onView).toHaveBeenCalledWith('e1');
  });

  it('label 空字串 → 以類別「其他」顯示', async () => {
    const { getByText } = await render(
      <ReminderToast
        card={{ ...card, bodyParams: { label: '', minutes: 5 } }}
        onView={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    expect(getByText(/其他/)).toBeTruthy();
  });

  it('card=null → 不渲染', async () => {
    const { toJSON } = await render(
      <ReminderToast card={null} onView={jest.fn()} onDismiss={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });
});
