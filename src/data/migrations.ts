/**
 * SQLite migration 定義與執行器——自 db.native.ts 抽離的純邏輯(介面注入,
 * Jest 可測;NFR-5)。每版一個交易:BEGIN → DDL → PRAGMA user_version=v+1 → COMMIT;
 * 失敗 ROLLBACK 後外拋(已提交的前置版本保留)。
 */

/** migration 所需的最小資料庫介面(expo-sqlite SQLiteDatabase 的子集) */
export interface MigrationDb {
  execAsync(source: string): Promise<unknown>;
  getFirstAsync<T>(source: string): Promise<T | null>;
}

export const MIGRATIONS: readonly string[] = [
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

/**
 * 依 PRAGMA user_version 依序套用未執行的 migration(冪等)。
 * 回傳本次套用的版數;失敗時 ROLLBACK 並外拋。
 */
export async function applyMigrations(db: MigrationDb): Promise<number> {
  const current = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = current?.user_version ?? 0;
  let applied = 0;
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
    applied++;
  }
  return applied;
}
