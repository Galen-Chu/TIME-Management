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
  weekdayIndex,
  type Event,
} from '../domain/events';
import type { EventRepository } from '../data/repository';
import type { Routine } from '../data/routine-types';
import type { ScheduleRepository } from '../data/schedule-repository';
import type { ScheduleItem } from '../data/schedule-types';
import { uid } from '../utils/uid';
import { useSettings } from './settings';

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
  /** 一次性種子例行工事(僅空 repo 且未播種過;防刪光後復活) */
  ensureSeeded: () => Promise<void>;
  createEvent: (input: {
    start: number;
    end: number;
    category: CategoryKey;
    label: string;
    source?: Event['source'];
    predicted?: boolean;
  }) => Promise<boolean>; // false = 重疊或不合法
  /** 智慧服務產出的待確認事件(smartTick):保留傳入 id 達成冪等,重疊/已存在者略過 */
  applyPredictedEvents: (items: Array<Omit<Event, 'createdAt' | 'updatedAt'>>) => Promise<void>;
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
    const routines: RoutineVM[] = routinesRaw.map((r) => {
      const recalced = recalcStreak(r, d);
      return { ...recalced, doneToday: recalced.doneDate === d };
    });
    set({ events, weekEvents, routines, schedules: schedulesRaw, loading: false });
  },

  ensureSeeded: async () => {
    if (!routineRepo) return;
    const { settings, update } = useSettings.getState();
    if (settings.seededRoutines) return;
    const existing = await routineRepo.list();
    if (existing.length === 0) {
      for (const r of defaultRoutines()) {
        await routineRepo.insert(r);
      }
    }
    update({ seededRoutines: true });
  },

  createEvent: async (input) => {
    if (!repo) return false;
    const start = snap(input.start);
    const end = snap(input.end);
    const candidate = { start, end };
    if (!canAdd(candidate, get().events)) return false;
    const now = Date.now();
    const event: Event = {
      id: uid('e'),
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

  applyPredictedEvents: async (items) => {
    if (!repo || items.length === 0) return;
    const existingIds = new Set(get().events.map((e) => e.id));
    // 以本地副本累加本批已寫入者,避免同批互相重疊的候選全部通過
    const taken: Array<Pick<Event, 'start' | 'end' | 'id'>> = [...get().events];
    const now = Date.now();
    let inserted = false;
    for (const e of items) {
      if (existingIds.has(e.id)) continue;
      if (!canAdd(e, taken)) continue;
      await repo.insert({ ...e, createdAt: now, updatedAt: now });
      taken.push(e);
      existingIds.add(e.id);
      inserted = true;
    }
    if (inserted) await get().load();
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
      id: uid('r'),
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

// 走查/debug 用:暴露 store 到 window(web only;限開發模式)
import { Platform } from 'react-native';
if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (globalThis as unknown as Record<string, unknown>).__timecareStore = useTodayStore;
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
