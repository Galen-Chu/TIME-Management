/**
 * 通知服務測試:leadTime 邊界、免打擾抑制、排程到點冪等。
 */
import { checkEventReminder, dueSchedulesToEvents, inQuietHours } from '../notification';
import type { Event } from '../../domain/events';
import type { ScheduleItem } from '../../data/schedule-types';

function ev(id: string, start: number, end: number, label = '測試'): Event {
  return { id, date: '2026-08-25', start, end, category: 'work', label, predicted: false, source: 'manual', createdAt: 0, updatedAt: 0 };
}

describe('inQuietHours', () => {
  it('22:00–07:00', () => {
    expect(inQuietHours(23)).toBe(true);
    expect(inQuietHours(3)).toBe(true);
    expect(inQuietHours(12)).toBe(false);
    expect(inQuietHours(21.99)).toBe(false);
    expect(inQuietHours(7)).toBe(false);
  });
});

describe('checkEventReminder', () => {
  const event = { id: 'e1', start: 10, label: '會議', predicted: false };

  it('距離超過 leadTime:不觸發', () => {
    const r = checkEventReminder({ event, currentHour: 9, leadTime: 15, notifyStyle: 'push', quietHoursOn: true });
    expect(r.type).toBe('none');
  });

  it('進入 leadTime 窗口:推播(push),文案為 i18n key + 參數', () => {
    const r = checkEventReminder({ event, currentHour: 9.8, leadTime: 15, notifyStyle: 'push', quietHoursOn: true });
    expect(r.type).toBe('push');
    if (r.type === 'push') {
      expect(r.titleKey).toBe('notify.push.upcomingTitle');
      expect(r.bodyParams).toEqual({ label: '會議', minutes: 12 });
    }
  });

  it('預測事件的推播標題採 predictedTitle key', () => {
    const predicted = { id: 'e3', start: 10, label: '推測工作', predicted: true };
    const r = checkEventReminder({ event: predicted, currentHour: 9.8, leadTime: 15, notifyStyle: 'push', quietHoursOn: false });
    expect(r.type).toBe('push');
    if (r.type === 'push') expect(r.titleKey).toBe('notify.push.predictedTitle');
  });

  it('溫和模式:App 內卡片(不推播),附文案 key 與參數', () => {
    const r = checkEventReminder({ event, currentHour: 9.8, leadTime: 15, notifyStyle: 'gentle', quietHoursOn: true });
    expect(r.type).toBe('in-app-card');
    if (r.type === 'in-app-card') {
      expect(r.titleKey).toBe('notify.push.upcomingTitle');
      expect(r.bodyParams).toEqual({ label: '會議', minutes: 12 });
    }
  });

  it('免打擾+push:降級為 App 內', () => {
    const midnight = { id: 'e2', start: 23.5, label: '夜間事件', predicted: true };
    const r = checkEventReminder({ event: midnight, currentHour: 23.2, leadTime: 20, notifyStyle: 'push', quietHoursOn: true });
    expect(r.type).toBe('in-app-card');
  });

  it('免打擾關閉:半夜照常推播', () => {
    const midnight = { id: 'e2', start: 23.5, label: '夜間事件', predicted: false };
    const r = checkEventReminder({ event: midnight, currentHour: 23.2, leadTime: 20, notifyStyle: 'push', quietHoursOn: false });
    expect(r.type).toBe('push');
  });

  it('已開始(not-due)', () => {
    const r = checkEventReminder({ event, currentHour: 10.5, leadTime: 15, notifyStyle: 'push', quietHoursOn: false });
    expect(r.type).toBe('none');
  });
});

describe('dueSchedulesToEvents(§A4)', () => {
  const sched: ScheduleItem = {
    id: 's1', title: '晨間瑜伽', category: 'exercise',
    recurrence: 'daily', weekdays: [], time: 7, durationH: 1, reminderOn: true,
  };

  it('時間已到 → 生成待確認事件', () => {
    const r = dueSchedulesToEvents([sched], '2026-08-25', 7.1, 15, []);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ predicted: true, source: 'predicted', label: '晨間瑜伽' });
  });

  it('冪等:同 id 已存在 → 不重複生成', () => {
    const existing = [ev('sched-s1-2026-08-25', 7, 8, '晨間瑜伽')];
    const r = dueSchedulesToEvents([sched], '2026-08-25', 7.1, 15, existing);
    expect(r).toHaveLength(0);
  });

  it('與已確認事件重疊 → 跳過', () => {
    const existing = [ev('blocker', 6.5, 8, '已有事件')];
    const r = dueSchedulesToEvents([sched], '2026-08-25', 7.1, 15, existing);
    expect(r).toHaveLength(0);
  });

  it('非今日(每週三排程,今天是週二)→ 不生成', () => {
    const weekly: ScheduleItem = { ...sched, recurrence: 'weekly', weekdays: [3] };
    const r = dueSchedulesToEvents([weekly], '2026-08-25', 7, 15, []); // 08-25=週二
    expect(r).toHaveLength(0);
  });

  it('尚未進入 leadTime → 不生成', () => {
    const r = dueSchedulesToEvents([sched], '2026-08-25', 6, 15, []); // 距 7:00 有 60min > 15min
    expect(r).toHaveLength(0);
  });
});
