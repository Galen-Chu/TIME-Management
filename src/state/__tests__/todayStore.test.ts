/**
 * todayStore 流程測試(InMemory repository):CRUD、重疊防護、確認預測、streak ±1。
 */
import { InMemoryEventRepository, InMemoryRoutineRepository } from '../../data/repository';
import type { Routine } from '../../data/routine-types';
import { __resetForTest, useTodayStore } from '../todayStore';

const TODAY = '2026-08-24';

const seedRoutines: Routine[] = [
  { id: 'r1', label: 'today.seedRoutine.meditation', timeHint: '07:15', streak: 5, doneDate: null },
];

async function setup() {
  __resetForTest();
  const events = new InMemoryEventRepository();
  const routines = new InMemoryRoutineRepository(seedRoutines);
  useTodayStore.getState().attach(events, routines);
  useTodayStore.setState({ date: TODAY, events: [], routines: [], weekEvents: [] });
  await useTodayStore.getState().load(TODAY);
}

describe('事件 CRUD 與重疊防護', () => {
  it('建立 → 列表出現', async () => {
    await setup();
    const ok = await useTodayStore.getState().createEvent({
      start: 9, end: 12, category: 'work', label: '專案開發',
    });
    expect(ok).toBe(true);
    expect(useTodayStore.getState().events).toHaveLength(1);
    expect(useTodayStore.getState().events[0].source).toBe('manual');
  });

  it('重疊拒絕(false 且不寫入)', async () => {
    await setup();
    await useTodayStore.getState().createEvent({ start: 9, end: 12, category: 'work', label: 'A' });
    const bad = await useTodayStore.getState().createEvent({ start: 11, end: 13, category: 'work', label: 'B' });
    expect(bad).toBe(false);
    expect(useTodayStore.getState().events).toHaveLength(1);
  });

  it('時長不合法拒絕', async () => {
    await setup();
    const bad = await useTodayStore.getState().createEvent({ start: 9, end: 9, category: 'other', label: 'X' });
    expect(bad).toBe(false);
  });

  it('更新與刪除', async () => {
    await setup();
    await useTodayStore.getState().createEvent({ start: 14, end: 16, category: 'leisure', label: '閱讀' });
    const id = useTodayStore.getState().events[0].id;
    await useTodayStore.getState().updateEvent(id, { label: '深度閱讀', category: 'work' });
    expect(useTodayStore.getState().events[0].label).toBe('深度閱讀');
    expect(useTodayStore.getState().events[0].category).toBe('work');
    await useTodayStore.getState().deleteEvent(id);
    expect(useTodayStore.getState().events).toHaveLength(0);
  });

  it('確認預測:predicted → false', async () => {
    await setup();
    await useTodayStore.getState().createEvent({
      start: 15, end: 17, category: 'work', label: '深度工作', predicted: true, source: 'predicted',
    });
    const id = useTodayStore.getState().events[0].id;
    expect(useTodayStore.getState().events[0].predicted).toBe(true);
    await useTodayStore.getState().confirmEvent(id);
    expect(useTodayStore.getState().events[0].predicted).toBe(false);
  });
});

describe('例行工事 streak', () => {
  it('完成 +1、取消 −1、doneDate 同步', async () => {
    await setup();
    await useTodayStore.getState().toggleRoutine('r1');
    let r = useTodayStore.getState().routines[0];
    expect(r.streak).toBe(6);
    expect(r.doneToday).toBe(true);

    await useTodayStore.getState().toggleRoutine('r1');
    r = useTodayStore.getState().routines[0];
    expect(r.streak).toBe(5);
    expect(r.doneToday).toBe(false);
  });

  it('跨日重算:昨日未完成 → 歸零', async () => {
    await setup();
    const routines = new InMemoryRoutineRepository([
      { id: 'r2', label: 'x', timeHint: '07:00', streak: 9, doneDate: '2026-08-20' }, // 前天
    ]);
    useTodayStore.getState().attach(new InMemoryEventRepository(), routines);
    await useTodayStore.getState().load(TODAY);
    const r = useTodayStore.getState().routines.find((x) => x.id === 'r2');
    expect(r?.streak).toBe(0);
    expect(r?.doneToday).toBe(false);
  });
});
