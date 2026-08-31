/**
 * 時間軸檢視渲染測試(P3):刻度、事件塊(a11y label)、點空白新增的按壓層。
 */
import { fireEvent, render } from '@testing-library/react-native';

import i18n from '../../../i18n'; // 初始化 i18next(元件文案走 zh-TW 預設)
import type { Event } from '../../../domain/events';
import { TimelineView } from '../timeline-view';

void i18n;

const NOW = new Date('2026-08-24T10:30:00'); // 固定時刻(now prop 注入,畫面確定)

const events: Event[] = [
  {
    id: 'e1', date: '2026-08-24', start: 9, end: 12, category: 'work',
    label: '專注工作', predicted: false, source: 'manual', createdAt: 0, updatedAt: 0,
  },
  {
    id: 'p1', date: '2026-08-24', start: 15, end: 16, category: 'exercise',
    label: '傍晚散步', predicted: true, source: 'predicted', createdAt: 0, updatedAt: 0,
  },
];

describe('TimelineView(時間軸)', () => {
  it('渲染刻度與事件塊(含預測);固定 now 下現在線標籤為 10:30', async () => {
    const { getByText, getByLabelText } = await render(
      <TimelineView events={events} now={NOW} onSelect={jest.fn()} onCreate={jest.fn()} />
    );

    expect(getByText('08:00')).toBeTruthy(); // 每 2 小時刻度
    expect(getByLabelText('專注工作')).toBeTruthy();
    expect(getByLabelText('傍晚散步')).toBeTruthy();
    expect(getByText('10:30')).toBeTruthy(); // 現在線標籤(useNow 注入)
  });

  it('點按壓層(a11y:新增事件)可達;點事件塊回呼 onSelect', async () => {
    const onSelect = jest.fn();
    const { getByLabelText, getByRole } = await render(
      <TimelineView events={events} now={NOW} onSelect={onSelect} onCreate={jest.fn()} />
    );

    expect(getByRole('button', { name: '新增事件' })).toBeTruthy();
    fireEvent.press(getByLabelText('專注工作'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });
});
