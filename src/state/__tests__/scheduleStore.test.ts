/**
 * 排程 store 流程測試(InMemory):新增/更新/刪除、提醒開關。
 */
import { InMemoryEventRepository, InMemoryRoutineRepository } from '../../data/repository';
import { InMemoryScheduleRepository } from '../../data/schedule-repository';
import type { ScheduleItem } from '../../data/schedule-types';
import { __resetForTest, useTodayStore } from '../todayStore';

const TODAY = '2026-08-24';

const sample: ScheduleItem = {
  id: 's1',
  title: '晨間瑜伽',
  category: 'exercise',
  recurrence: 'weekly',
  weekdays: [1, 3, 5],
  time: 7,
  durationH: 1,
  reminderOn: true,
};

async function setup() {
  __resetForTest();
  useTodayStore.getState().attach(
    new InMemoryEventRepository(),
    new InMemoryRoutineRepository(),
    new InMemoryScheduleRepository()
  );
  useTodayStore.setState({ date: TODAY, events: [], routines: [], schedules: [], weekEvents: [] });
  await useTodayStore.getState().load(TODAY);
}

describe('排程 store', () => {
  it('新增 → 清單出現;同 id 更新;刪除', async () => {
    await setup();
    await useTodayStore.getState().saveSchedule(sample);
    expect(useTodayStore.getState().schedules).toHaveLength(1);

    await useTodayStore.getState().saveSchedule({ ...sample, title: '晨間瑜伽改' });
    expect(useTodayStore.getState().schedules[0].title).toBe('晨間瑜伽改');
    expect(useTodayStore.getState().schedules).toHaveLength(1);

    await useTodayStore.getState().deleteSchedule('s1');
    expect(useTodayStore.getState().schedules).toHaveLength(0);
  });

  it('例行工事 CRUD', async () => {
    await setup();
    await useTodayStore.getState().addRoutine({ label: 'today.seedRoutine.walk', timeHint: '08:00' });
    const list = useTodayStore.getState().routines;
    expect(list.some((r) => r.timeHint === '08:00')).toBe(true);
    const id = list.find((r) => r.timeHint === '08:00')!.id;
    await useTodayStore.getState().removeRoutine(id);
    expect(useTodayStore.getState().routines.every((r) => r.id !== id)).toBe(true);
  });
});
