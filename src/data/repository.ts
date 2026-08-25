/**
 * 資料層:Repository 介面 + InMemory 實作(測試與 web 預覽)。
 * native 以 expo-sqlite 實作(db.ts);store 僅依賴本介面(ARCHITECTURE 依賴方向)。
 */
import type { Event } from '../domain/events';
import type { Routine } from './routine-types';

export interface EventRepository {
  listByDate(date: string): Promise<Event[]>;
  listRange(from: string, to: string): Promise<Event[]>; // 週檢視(含)
  insert(event: Event): Promise<void>;
  update(event: Event): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface RoutineRepository {
  list(): Promise<Routine[]>;
  insert(routine: Routine): Promise<void>;
  update(routine: Routine): Promise<void>;
  remove(id: string): Promise<void>;
}

/** 記憶體實作(Jest 與 web 預覽;不持久化) */
export class InMemoryEventRepository implements EventRepository {
  private items: Event[] = [];

  async listByDate(date: string): Promise<Event[]> {
    return this.items.filter((e) => e.date === date).sort((a, b) => a.start - b.start);
  }

  async listRange(from: string, to: string): Promise<Event[]> {
    return this.items.filter((e) => e.date >= from && e.date <= to).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }

  async insert(event: Event): Promise<void> {
    this.items.push({ ...event });
  }

  async update(event: Event): Promise<void> {
    const i = this.items.findIndex((e) => e.id === event.id);
    if (i >= 0) this.items[i] = { ...event };
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((e) => e.id !== id);
  }
}

export class InMemoryRoutineRepository implements RoutineRepository {
  private items: Routine[] = [];

  constructor(seed: Routine[] = []) {
    this.items = seed.map((r) => ({ ...r }));
  }

  async list(): Promise<Routine[]> {
    return this.items.map((r) => ({ ...r }));
  }

  async insert(routine: Routine): Promise<void> {
    this.items.push({ ...routine });
  }

  async update(routine: Routine): Promise<void> {
    const i = this.items.findIndex((r) => r.id === routine.id);
    if (i >= 0) this.items[i] = { ...routine };
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((r) => r.id !== id);
  }
}
