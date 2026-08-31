/**
 * 日誌卡檢視渲染測試(P3):統計卡、今日排程、例行工事(streak 互動)、
 * 已完成、AI 預測待確認、空狀態。走 InMemory repos + 真實 store 流程。
 */
import { act, fireEvent, render } from '@testing-library/react-native';

import i18n from '../../../i18n'; // 初始化 i18next(元件文案走 zh-TW 預設)
import { InMemoryEventRepository, InMemoryRoutineRepository } from '../../../data/repository';
import { InMemoryScheduleRepository } from '../../../data/schedule-repository';
import type { Event } from '../../../domain/events';
import { __resetForTest, useTodayStore } from '../../../state/todayStore';
import { useSettings } from '../../../state/settings';
import { BlocksView } from '../blocks-view';

void i18n;

const TODAY = '2026-08-24'; // 週一

function ev(partial: Partial<Event> & Pick<Event, 'id' | 'start' | 'end' | 'label' | 'category'>): Event {
  return {
    date: TODAY,
    predicted: false,
    source: 'manual',
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  };
}

async function setupWithData() {
  __resetForTest();
  useSettings.setState((s) => ({ settings: { ...s.settings, seededRoutines: true } }));
  const events = new InMemoryEventRepository();
  await events.insert(ev({ id: 'e1', start: 9, end: 12, label: '專注工作', category: 'work' }));
  await events.insert(
    ev({ id: 'p1', start: 15, end: 16, label: '傍晚散步', category: 'exercise', predicted: true, source: 'predicted' })
  );
  const routines = new InMemoryRoutineRepository([
    { id: 'r1', label: 'today.seedRoutine.meditation', timeHint: '07:15', streak: 0, doneDate: null },
  ]);
  const schedules = new InMemoryScheduleRepository([
    {
      id: 's1', title: '晨間瑜伽', category: 'exercise',
      recurrence: 'daily', weekdays: [], time: 7, durationH: 1, reminderOn: true,
    },
  ]);
  useTodayStore.getState().attach(events, routines, schedules);
  useTodayStore.setState({ date: TODAY, events: [], routines: [], schedules: [], weekEvents: [] });
  await useTodayStore.getState().load(TODAY);
}

describe('BlocksView(日誌卡檢視)', () => {
  it('統計卡+今日排程+例行工事(i18n 種子標籤)+已完成+預測待確認皆渲染', async () => {
    await setupWithData();
    const { getByText } = await render(<BlocksView onSelect={jest.fn()} />);

    // 區塊標題
    expect(getByText('每日例行工事')).toBeTruthy();
    expect(getByText('今日排程')).toBeTruthy();
    expect(getByText('已完成')).toBeTruthy();
    expect(getByText('AI 預測 · 待確認')).toBeTruthy();

    // 種子例行標籤經 t() 解析('today.seedRoutine.meditation' → 晨間冥想)
    expect(getByText('晨間冥想')).toBeTruthy();
    // 今日排程與事件
    expect(getByText('晨間瑜伽')).toBeTruthy();
    expect(getByText('專注工作')).toBeTruthy();
    expect(getByText('傍晚散步')).toBeTruthy();
    // 預測卡的確認標籤
    expect(getByText('確認')).toBeTruthy();
  });

  it('勾選例行工事:streak 0 → 1、再取消 → 0', async () => {
    await setupWithData();
    const { getByText, getByRole } = await render(<BlocksView onSelect={jest.fn()} />);

    const row = getByRole('checkbox', { name: '晨間冥想' });
    await act(async () => {
      fireEvent.press(row);
    });
    expect(getByText(/連續 1 天/)).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByRole('checkbox', { name: '晨間冥想' }));
    });
    expect(getByText(/連續 0 天/)).toBeTruthy();
  });

  it('空資料:顯示紀錄與例行工事空狀態', async () => {
    __resetForTest();
    useSettings.setState((s) => ({ settings: { ...s.settings, seededRoutines: true } }));
    useTodayStore.getState().attach(
      new InMemoryEventRepository(),
      new InMemoryRoutineRepository(),
      new InMemoryScheduleRepository()
    );
    useTodayStore.setState({ date: TODAY, events: [], routines: [], schedules: [], weekEvents: [] });
    await useTodayStore.getState().load(TODAY);

    const { getByText } = await render(<BlocksView onSelect={jest.fn()} />);
    expect(getByText('還沒有任何紀錄')).toBeTruthy();
    expect(getByText('還沒有例行工事')).toBeTruthy();
  });
});
