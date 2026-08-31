/**
 * 週檢視渲染測試(P3):週一為首 7 列、圖例、長按回呼該日。
 */
import { fireEvent, render } from '@testing-library/react-native';

import i18n from '../../../i18n'; // 初始化 i18next(元件文案走 zh-TW 預設)
import type { Event } from '../../../domain/events';
import { WeekView } from '../week-view';

void i18n;

const events: Event[] = [
  {
    id: 'e1', date: '2026-08-24', start: 9, end: 12, category: 'work',
    label: '專注工作', predicted: false, source: 'manual', createdAt: 0, updatedAt: 0,
  },
];

describe('WeekView(週檢視)', () => {
  it('週一起始 7 列 + 類別圖例', async () => {
    const { getByText, getAllByText } = await render(
      <WeekView weekEvents={events} date="2026-08-26" onPickDate={jest.fn()} />
    );
    // 週一為首(錨定週三 08-26,首列為 08-24 週一)
    expect(getByText('週一')).toBeTruthy();
    expect(getByText('週日')).toBeTruthy();
    // 每列右側 24h 標籤 ×7
    expect(getAllByText('24h')).toHaveLength(7);
    // 圖例:七大類別
    expect(getByText('工作')).toBeTruthy();
    expect(getByText('通勤')).toBeTruthy();
  });

  it('長按某日 → onPickDate 帶該日日期 key', async () => {
    const onPickDate = jest.fn();
    const { getByLabelText } = await render(
      <WeekView weekEvents={events} date="2026-08-26" onPickDate={onPickDate} />
    );
    fireEvent(getByLabelText('2026-08-25'), 'longPress');
    expect(onPickDate).toHaveBeenCalledWith('2026-08-25');
  });
});
