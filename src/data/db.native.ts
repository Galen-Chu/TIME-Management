/**
 * expo-sqlite 實作(native 平台檔;web 見 db.ts——Metro 按平台自動選檔)。
 * 開庫 + migration(冪等,PRAGMA user_version)+ Sqlite Repository。
 */
import * as SQLite from 'expo-sqlite';

import type { Event } from '../domain/events';
import type { EventRepository, RoutineRepository } from './repository';
import type { Routine } from './routine-types';
import type { ScheduleItem } from './schedule-types';
import type { ScheduleRepository } from './schedule-repository';

export interface Repositories {
  events: EventRepository;
  routines: RoutineRepository;
  schedules: ScheduleRepository;
}

const MIGRATIONS: string[] = [
  // v1:events + routines
  `
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    start REAL NOT NULL,
    end REAL NOT NULL,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    predicted INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  `,
  `
  CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY NOT NULL,
    label TEXT NOT NULL,
    timeHint TEXT NOT NULL,
    streak INTEGER NOT NULL DEFAULT 0,
    doneDate TEXT
  );
  `,
  // v3:schedules(DESIGN-ADDENDUM §A5 結構化欄位)
  `
  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    recurrence TEXT NOT NULL,
    weekdays TEXT NOT NULL DEFAULT '[]',
    date TEXT,
    time REAL NOT NULL,
    durationH REAL NOT NULL DEFAULT 1,
    reminderOn INTEGER NOT NULL DEFAULT 1
  );
  `,
];

interface Row {
  id: string; date: string; start: number; end: number; category: string;
  label: string; predicted: number; source: string; createdAt: number; updatedAt: number;
}

function rowToEvent(r: Row): Event {  return {
    id: r.id,
    date: r.date,
    start: r.start,
    end: r.end,
    category: r.category as Event['category'],
    label: r.label,
    predicted: !!r.predicted,
    source: r.source as Event['source'],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class SqliteEventRepository implements EventRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async listByDate(date: string): Promise<Event[]> {
    const rows = await this.db.getAllAsync<Row>(
      'SELECT * FROM events WHERE date = ? ORDER BY start',
      [date]
    );
    return rows.map(rowToEvent);
  }

  async listRange(from: string, to: string): Promise<Event[]> {
    const rows = await this.db.getAllAsync<Row>(
      'SELECT * FROM events WHERE date >= ? AND date <= ? ORDER BY date, start',
      [from, to]
    );
    return rows.map(rowToEvent);
  }

  async insert(e: Event): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO events (id, date, start, end, category, label, predicted, source, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [e.id, e.date, e.start, e.end, e.category, e.label, e.predicted ? 1 : 0, e.source, e.createdAt, e.updatedAt]
    );
  }

  async update(e: Event): Promise<void> {
    await this.db.runAsync(
      'UPDATE events SET date=?, start=?, end=?, category=?, label=?, predicted=?, source=?, updatedAt=? WHERE id=?',
      [e.date, e.start, e.end, e.category, e.label, e.predicted ? 1 : 0, e.source, e.updatedAt, e.id]
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM events WHERE id=?', [id]);
  }
}

export class SqliteRoutineRepository implements RoutineRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async list(): Promise<Routine[]> {
    const rows = await this.db.getAllAsync<{
      id: string; label: string; timeHint: string; streak: number; doneDate: string | null;
    }>('SELECT * FROM routines ORDER BY timeHint');
    return rows.map((r) => ({ ...r }));
  }

  async insert(r: Routine): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO routines (id, label, timeHint, streak, doneDate) VALUES (?,?,?,?,?)',
      [r.id, r.label, r.timeHint, r.streak, r.doneDate]
    );
  }

  async update(r: Routine): Promise<void> {
    await this.db.runAsync(
      'UPDATE routines SET label=?, timeHint=?, streak=?, doneDate=? WHERE id=?',
      [r.label, r.timeHint, r.streak, r.doneDate, r.id]
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM routines WHERE id=?', [id]);
  }
}

export class SqliteScheduleRepository implements ScheduleRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  private rowToItem(r: {
    id: string; title: string; category: string; recurrence: string;
    weekdays: string; date: string | null; time: number; durationH: number; reminderOn: number;
  }): ScheduleItem {
    return {
      id: r.id,
      title: r.title,
      category: r.category as ScheduleItem['category'],
      recurrence: r.recurrence as ScheduleItem['recurrence'],
      weekdays: JSON.parse(r.weekdays) as number[],
      date: r.date ?? undefined,
      time: r.time,
      durationH: r.durationH,
      reminderOn: !!r.reminderOn,
    };
  }

  async list(): Promise<ScheduleItem[]> {
    const rows = await this.db.getAllAsync('SELECT * FROM schedules ORDER BY time');
    return (rows as unknown[]).map((r) =>
      this.rowToItem(r as Parameters<SqliteScheduleRepository['rowToItem']>[0])
    );
  }

  async insert(s: ScheduleItem): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO schedules (id, title, category, recurrence, weekdays, date, time, durationH, reminderOn) VALUES (?,?,?,?,?,?,?,?,?)',
      [s.id, s.title, s.category, s.recurrence, JSON.stringify(s.weekdays), s.date ?? null, s.time, s.durationH, s.reminderOn ? 1 : 0]
    );
  }

  async update(s: ScheduleItem): Promise<void> {
    await this.db.runAsync(
      'UPDATE schedules SET title=?, category=?, recurrence=?, weekdays=?, date=?, time=?, durationH=?, reminderOn=? WHERE id=?',
      [s.title, s.category, s.recurrence, JSON.stringify(s.weekdays), s.date ?? null, s.time, s.durationH, s.reminderOn ? 1 : 0, s.id]
    );
  }

  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM schedules WHERE id=?', [id]);
  }
}

let cached: Repositories | null = null;

/** Repository 工廠(native):expo-sqlite 開庫 + migration */
export async function createRepositories(): Promise<Repositories> {
  if (cached) return cached;
  const db = await SQLite.openDatabaseAsync('timecare.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const current = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = current?.user_version ?? 0;
  for (let v = version; v < MIGRATIONS.length; v++) {
    await db.execAsync('BEGIN;');
    try {
      await db.execAsync(MIGRATIONS[v]);
      await db.execAsync(`PRAGMA user_version = ${v + 1};`);
      await db.execAsync('COMMIT;');
    } catch (err) {
      await db.execAsync('ROLLBACK;');
      throw err;
    }
  }
  cached = {
    events: new SqliteEventRepository(db),
    routines: new SqliteRoutineRepository(db),
    schedules: new SqliteScheduleRepository(db),
  };
  return cached;
}
