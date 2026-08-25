/**
 * 排程 Repository:介面 + InMemory(web/測試)。
 * SQLite 實作見 db.native.ts migration v3。
 */
import type { ScheduleItem } from './schedule-types';

export interface ScheduleRepository {
  list(): Promise<ScheduleItem[]>;
  insert(item: ScheduleItem): Promise<void>;
  update(item: ScheduleItem): Promise<void>;
  remove(id: string): Promise<void>;
}

export class InMemoryScheduleRepository implements ScheduleRepository {
  private items: ScheduleItem[] = [];

  constructor(seed: ScheduleItem[] = []) {
    this.items = seed.map((s) => ({ ...s }));
  }

  async list(): Promise<ScheduleItem[]> {
    return this.items.map((s) => ({ ...s }));
  }

  async insert(item: ScheduleItem): Promise<void> {
    this.items.push({ ...item });
  }

  async update(item: ScheduleItem): Promise<void> {
    const i = this.items.findIndex((s) => s.id === item.id);
    if (i >= 0) this.items[i] = { ...item };
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((s) => s.id !== id);
  }
}
