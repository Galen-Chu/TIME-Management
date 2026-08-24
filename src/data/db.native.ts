/**
 * expo-sqlite 實作(native 平台檔;web 見 db.ts——Metro 按平台自動選檔)。
 * 開庫 + migration(冪等,PRAGMA user_version)+ Sqlite Repository。
 */
import * as SQLite from 'expo-sqlite';

import type { Event } from '../domain/events';
import type { EventRepository, RoutineRepository } from './repository';
import type { Routine } from './routine-types';

export interface Repositories {
  events: EventRepository;
  routines: RoutineRepository;
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

  async update(r: Routine): Promise<void> {
    await this.db.runAsync(
      'UPDATE routines SET label=?, timeHint=?, streak=?, doneDate=? WHERE id=?',
      [r.label, r.timeHint, r.streak, r.doneDate, r.id]
    );
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
  cached = { events: new SqliteEventRepository(db), routines: new SqliteRoutineRepository(db) };
  return cached;
}
