/**
 * Migration 執行器測試(P3:自 db.native.ts 抽離的純邏輯)。
 * FakeDb 記錄執行語句與 user_version,驗證順序、冪等與失敗回滾。
 */
import { applyMigrations, MIGRATIONS, type MigrationDb } from '../migrations';

class FakeDb implements MigrationDb {
  executed: string[] = [];
  version = 0;
  /** 命中此子字串的語句將拋錯(模擬 DDL 失敗) */
  failOn: string | null = null;

  async execAsync(sql: string): Promise<unknown> {
    if (this.failOn && sql.includes(this.failOn)) throw new Error('ddl failed');
    const m = sql.match(/^PRAGMA user_version = (\d+)/);
    if (m) this.version = Number(m[1]);
    this.executed.push(sql);
    return null;
  }

  async getFirstAsync<T>(_sql: string): Promise<T | null> {
    return { user_version: this.version } as T;
  }
}

describe('applyMigrations', () => {
  it('全新資料庫:依序套用全部版本,每版 BEGIN/COMMIT 包裹', async () => {
    const db = new FakeDb();
    const applied = await applyMigrations(db);
    expect(applied).toBe(MIGRATIONS.length);
    expect(db.version).toBe(MIGRATIONS.length);
    // 每版一個交易
    expect(db.executed.filter((s) => s === 'BEGIN;')).toHaveLength(MIGRATIONS.length);
    expect(db.executed.filter((s) => s === 'COMMIT;')).toHaveLength(MIGRATIONS.length);
    // DDL 內容:events/routines/schedules 三表
    expect(db.executed.some((s) => s.includes('CREATE TABLE IF NOT EXISTS events'))).toBe(true);
    expect(db.executed.some((s) => s.includes('CREATE TABLE IF NOT EXISTS routines'))).toBe(true);
    expect(db.executed.some((s) => s.includes('CREATE TABLE IF NOT EXISTS schedules'))).toBe(true);
  });

  it('既有版本 2:僅套用第 3 版(冪等,不重跑舊版)', async () => {
    const db = new FakeDb();
    db.version = 2;
    const applied = await applyMigrations(db);
    expect(applied).toBe(1);
    expect(db.version).toBe(3);
    expect(db.executed.some((s) => s.includes('CREATE TABLE IF NOT EXISTS events'))).toBe(false);
    expect(db.executed.some((s) => s.includes('CREATE TABLE IF NOT EXISTS schedules'))).toBe(true);
  });

  it('已是最新版:no-op(0 版)', async () => {
    const db = new FakeDb();
    db.version = MIGRATIONS.length;
    expect(await applyMigrations(db)).toBe(0);
    expect(db.executed).toEqual([]);
  });

  it('中途失敗:ROLLBACK、外拋、版本停在已提交版(冪等可重試)', async () => {
    const db = new FakeDb();
    db.failOn = 'CREATE TABLE IF NOT EXISTS schedules'; // 第 3 版 DDL 失敗
    await expect(applyMigrations(db)).rejects.toThrow('ddl failed');
    expect(db.version).toBe(2); // 前兩版已提交保留
    expect(db.executed).toContain('ROLLBACK;');
    // 重試(故障排除後)從第 3 版繼續
    db.failOn = null;
    expect(await applyMigrations(db)).toBe(1);
    expect(db.version).toBe(3);
  });
});
