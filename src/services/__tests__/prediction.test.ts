/**
 * 預測服務情境測試(ROADMAP Phase 4:模擬感測器=純函式輸入)。
 */
import {
  CONFIDENCE_THRESHOLDS,
  historyModeAt,
  inSleepWindow,
  nextRoutineTime,
  predictNext,
  scheduleToEvent,
} from '../prediction';
import type { Event } from '../../domain/events';
import type { Routine } from '../../data/routine-types';

function ev(date: string, start: number, end: number, category: Event['category'] = 'work'): Event {
  return {
    id: `${date}-${start}-${category}`,
    date, start, end, category,
    label: '', predicted: false, source: 'manual',
    createdAt: 0, updatedAt: 0,
  };
}

function routine(id: string, timeHint: string, done = false): Routine {
  return { id, label: 'today.seedRoutine.meditation', timeHint, streak: 0, doneDate: done ? '2026-08-25' : null };
}

const SETTINGS = {
  sensitivity: 1 as const,
  sleepStart: 23,
  sleepEnd: 7,
  flexEnabled: false,
  irregularMode: false,
};

describe('敏感度門檻', () => {
  it('低/中/高 → 0.8/0.6/0.4', () => {
    expect(CONFIDENCE_THRESHOLDS).toEqual([0.8, 0.6, 0.4]);
  });
});

describe('inSleepWindow', () => {
  it('23–07 跨午夜:半夜 2 點在窗口內;中午不在', () => {
    expect(inSleepWindow(2, 23, 7)).toBe(true);
    expect(inSleepWindow(12, 23, 7)).toBe(false);
    expect(inSleepWindow(22.5, 23, 7)).toBe(true); // buffer 0.5
    expect(inSleepWindow(7.5, 23, 7)).toBe(true);
  });
});

describe('historyModeAt', () => {
  it('同時段眾數+比例', () => {
    const history = [
      ev('2026-08-20', 9, 12, 'work'),
      ev('2026-08-21', 9, 11, 'work'),
      ev('2026-08-22', 9, 12, 'work'),
      ev('2026-08-22', 14, 15, 'leisure'),
    ];
    const m = historyModeAt(history, 9);
    expect(m?.category).toBe('work');
    expect(m?.ratio).toBe(1);
  });
  it('無歷史 → null', () => {
    expect(historyModeAt([], 9)).toBeNull();
  });
});

describe('scheduleToEvent(§A4)', () => {
  it('排程 → predicted:true + source:predicted 事件', () => {
    const r = scheduleToEvent(
      { id: 's1', title: '晨間瑜伽', category: 'exercise', time: 7, durationH: 1 },
      '2026-08-25'
    );
    expect(r.event).toMatchObject({
      id: 'sched-s1-2026-08-25',
      date: '2026-08-25',
      start: 7,
      end: 8,
      category: 'exercise',
      label: '晨間瑜伽',
      predicted: true,
      source: 'predicted',
    });
  });
});

describe('predictNext 情境', () => {
  it('睡眠窗口:不預測', () => {
    const r = predictNext({
      date: '2026-08-25', hour: 2,
      events: [], routines: [], history: [],
      settings: SETTINGS,
    });
    expect(r.type).toBe('none');
    if (r.type === 'none') expect(r.reason).toBe('sleep-window');
  });

  it('睡眠窗口內但已醒(有事件覆蓋):不因睡眠窗口拒絕', () => {
    const r = predictNext({
      date: '2026-08-25', hour: 23.5,
      events: [ev('2026-08-25', 23, 24, 'leisure')],
      routines: [], history: [],
      settings: SETTINGS,
    });
    // 不因 sleep-window 被拒(可能因無候選而 none,但 reason 不是 sleep-window)
    if (r.type === 'none') {
      expect(r.reason).not.toBe('sleep-window');
    }
  });

  it('歷史眾數:連續三天同時段工作 → 信心 1.0 候選', () => {
    const history = [
      ev('2026-08-20', 9, 12, 'work'),
      ev('2026-08-21', 9, 11, 'work'),
      ev('2026-08-22', 9, 12, 'work'),
    ];
    const r = predictNext({
      date: '2026-08-25', hour: 8.5,
      events: [], routines: [], history,
      settings: SETTINGS,
    });
    expect(r.type).toBe('candidates');
    if (r.type === 'candidates') {
      expect(r.items[0].category).toBe('work');
      expect(r.items[0].confidence).toBeGreaterThanOrEqual(0.6);
    }
  });

  it('誠實失敗:無規律+低敏感度 → none', () => {
    const r = predictNext({
      date: '2026-08-25', hour: 14,
      events: [], routines: [],
      history: [ev('2026-08-20', 9, 10, 'work')], // 一筆不同時段
      settings: { ...SETTINGS, sensitivity: 0 },
    });
    expect(r.type).toBe('none');
  });

  it('非規律模式:信心打 6 折,低敏感度下被過濾', () => {
    const history = [
      ev('2026-08-20', 14, 16, 'leisure'),
      ev('2026-08-21', 14, 16, 'leisure'),
    ];
    const regular = predictNext({
      date: '2026-08-25', hour: 13.5,
      events: [], routines: [], history,
      settings: { ...SETTINGS, sensitivity: 0 }, // 門檻 0.8
    });
    const irregular = predictNext({
      date: '2026-08-25', hour: 13.5,
      events: [], routines: [], history,
      settings: { ...SETTINGS, sensitivity: 0, irregularMode: true },
    });
    // regular ratio=1 ≥ 0.8 → 有候選;irregular 1*0.6=0.6 < 0.8 → none
    expect(regular.type).toBe('candidates');
    expect(irregular.type).toBe('none');
  });

  it('彈性作息:候選帶區間(rangeStart/rangeEnd)', () => {
    const history = [
      ev('2026-08-20', 9, 12, 'work'),
      ev('2026-08-21', 9, 12, 'work'),
    ];
    const r = predictNext({
      date: '2026-08-25', hour: 8.5,
      events: [], routines: [], history,
      settings: { ...SETTINGS, flexEnabled: true },
    });
    expect(r.type).toBe('candidates');
    if (r.type === 'candidates') {
      expect(r.items[0].rangeStart).toBeDefined();
      expect(r.items[0].rangeEnd).toBeDefined();
      expect(r.items[0].rangeStart!).toBeLessThan(r.items[0].start);
    }
  });

  it('與既有事件重疊的候選被排除', () => {
    const history = [
      ev('2026-08-20', 9, 12, 'work'),
      ev('2026-08-21', 9, 12, 'work'),
    ];
    const today: Event[] = [
      { ...ev('2026-08-25', 9, 17), label: '已有會議' },
    ];
    const r = predictNext({
      date: '2026-08-25', hour: 8.5,
      events: today, routines: [], history,
      settings: SETTINGS,
    });
    // 9-12 重疊被排除;可能只剩 none
    if (r.type === 'candidates') {
      r.items.forEach((c) => {
        const clash = today.some((e) =>
          e.start < c.end && c.start < e.end
        );
        expect(clash).toBe(false);
      });
    }
  });
});
