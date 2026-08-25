/**
 * 今日核心 store(Zustand):事件 CRUD、確認預測、例行工事 streak。
 * 依賴 Repository 介面(測試注入 InMemory;App 用 createRepositories)。
 */
import { create } from 'zustand';

import type { CategoryKey } from '../domain/categories';
import {
  canAdd,
  shiftDate,
  snap,
  toDateKey,
  type Event,
} from '../domain/events';
import type { EventRepository } from '../data/repository';
import type { Routine } from '../data/routine-types';
import type { ScheduleRepository } from '../data/schedule-repository';
import type { ScheduleItem } from '../data/schedule-types';

function uid(): string {
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export interface RoutineVM extends Routine {
  doneToday: boolean;
}

interface TodayStore {
  date: string;
  events: Event[];
  routines: RoutineVM[];
  schedules: ScheduleItem[];
  weekEvents: Event[]; // 週檢視(含當週 7 日)
  loading: boolean;

  // 測試/啟動注入
  attach: (
    events: EventRepository,
    routinesLegacy: import('../data/repository').RoutineRepository,
    schedules?: ScheduleRepository
  ) => void;

  load: (date?: string) => Promise<void>;
  createEvent: (input: {
    start: number;
    end: number;
    category: CategoryKey;
    label: string;
    source?: Event['source'];
    predicted?: boolean;
  }) => Promise<boolean>; // false = 重疊或不合法
  updateEvent: (id: string, patch: Partial<Pick<Event, 'label' | 'category'>> ) => Promise<void>;
  confirmEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleRoutine: (id: string) => Promise<void>;
  addRoutine: (input: { label: string; timeHint: string }) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
  saveSchedule: (item: ScheduleItem) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

let repo: EventRepository | null = null;
let routineRepo: import('../data/repository').RoutineRepository | null = null;
let scheduleRepo: ScheduleRepository | null = null;

/** 例行工事跨日重算(ARCHITECTURE streak 規則;Phase 2 簡化:昨日未完成歸零) */
function recalcStreak(r: Routine, today: string): Routine {
  if (r.doneDate && r.doneDate < shiftDate(today, -1) && r.streak > 0) {
    return { ...r, streak: 0 };
  }
  return r;
}

export const useTodayStore = create<TodayStore>((set, get) => ({
  date: toDateKey(new Date()),
  events: [],
  routines: [],
  schedules: [],
  weekEvents: [],
  loading: false,

  attach: (events, routinesLegacy, schedules) => {
    repo = events;
    routineRepo = routinesLegacy;
    scheduleRepo = schedules ?? null;
  },

  load: async (date) => {
    const d = date ?? get().date;
    if (!repo || !routineRepo) return;
    set({ loading: true, date: d });
    const [events, weekEvents, routinesRaw, schedulesRaw] = await Promise.all([
      repo.listByDate(d),
      repo.listRange(shiftDate(d, -(weekdayIndex(d) - 1)), shiftDate(d, 7 - weekdayIndex(d))),
      routineRepo.list(),
      scheduleRepo ? scheduleRepo.list() : Promise.resolve([]),
    ]);
    const routines: RoutineVM[] = (routinesRaw.length
      ? routinesRaw
      : defaultRoutines()
    ).map((r) => {
      const recalced = recalcStreak(r, d);
      return { ...recalced, doneToday: recalced.doneDate === d };
    });
    set({ events, weekEvents, routines, schedules: schedulesRaw, loading: false });
  },

  createEvent: async (input) => {
    if (!repo) return false;
    const start = snap(input.start);
    const end = snap(input.end);
    const candidate = { start, end };
    if (!canAdd(candidate, get().events)) return false;
    const now = Date.now();
    const event: Event = {
      id: uid(),
      date: get().date,
      start,
      end,
      category: input.category,
      label: input.label,
      predicted: input.predicted ?? false,
      source: input.source ?? 'manual',
      createdAt: now,
      updatedAt: now,
    };
    await repo.insert(event);
    await get().load();
    return true;
  },

  updateEvent: async (id, patch) => {
    if (!repo) return;
    const e = get().events.find((x) => x.id === id);
    if (!e) return;
    await repo.update({ ...e, ...patch, updatedAt: Date.now() });
    await get().load();
  },

  confirmEvent: async (id) => {
    if (!repo) return;
    const e = get().events.find((x) => x.id === id);
    if (!e) return;
    // 確認預測 = predicted:false 且不可逆(ARCHITECTURE invariant)
    await repo.update({ ...e, predicted: false, updatedAt: Date.now() });
    await get().load();
  },

  deleteEvent: async (id) => {
    if (!repo) return;
    await repo.remove(id);
    await get().load();
  },

  toggleRoutine: async (id) => {
    if (!routineRepo) return;
    const today = get().date;
    const r = get().routines.find((x) => x.id === id);
    if (!r) return;
    const nowDone = !r.doneToday;
    // 當日完成 → +1;當日取消 → −1(ARCHITECTURE streak 規則)
    const next: Routine = {
      ...r,
      streak: Math.max(0, r.streak + (nowDone ? 1 : -1)),
      doneDate: nowDone ? today : null,
    };
    await routineRepo.update(next);
    set((s) => ({
      routines: s.routines.map((x) =>
        x.id === id ? { ...next, doneToday: nowDone } : x
      ),
    }));
  },

  addRoutine: async (input) => {
    if (!routineRepo) return;
    await routineRepo.insert({
      id: uid(),
      label: input.label,
      timeHint: input.timeHint,
      streak: 0,
      doneDate: null,
    });
    await get().load();
  },

  removeRoutine: async (id) => {
    if (!routineRepo) return;
    await routineRepo.remove(id);
    set((s) => ({ routines: s.routines.filter((x) => x.id !== id) }));
  },

  saveSchedule: async (item) => {
    if (!scheduleRepo) return;
    const exists = get().schedules.some((s) => s.id === item.id);
    if (exists) {
      await scheduleRepo.update(item);
    } else {
      await scheduleRepo.insert(item);
    }
    await get().load();
  },

  deleteSchedule: async (id) => {
    if (!scheduleRepo) return;
    await scheduleRepo.remove(id);
    set((s) => ({ schedules: s.schedules.filter((x) => x.id !== id) }));
  },
}));

// 走查/debug 用:暴露 store 到 window(web only)
import { Platform } from 'react-native';
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__timecareStore = useTodayStore;
}

/** 週一=1 … 週日=7(date 所在週) */
function weekdayIndex(date: string): number {
  const d = new Date(`${date}T00:00:00`).getDay();
  return d === 0 ? 7 : d;
}

function defaultRoutines(): Routine[] {
  // Phase 2 種子例行工事(label 存 i18n key,顯示端 t() 解析;Phase 3 提供完整 CRUD)
  return [
    { id: 'seed-r1', label: 'today.seedRoutine.meditation', timeHint: '07:15', streak: 0, doneDate: null },
    { id: 'seed-r2', label: 'today.seedRoutine.walk', timeHint: '18:30', streak: 0, doneDate: null },
    { id: 'seed-r3', label: 'today.seedRoutine.reading', timeHint: '21:00', streak: 0, doneDate: null },
  ];
}

/** 測試用:重設模組級 repo 狀態 */
export function __resetForTest() {
  repo = null;
  routineRepo = null;
  scheduleRepo = null;
}
