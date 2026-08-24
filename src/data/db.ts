/**
 * web 版 Repository 工廠:InMemory(expo-sqlite 的 web worker/wasm 無法在此 metro-web 環境 bundle;
 * 開發預覽不持久化,native 持久化見 db.native.ts——Metro 自動按平台選檔)。
 */
import type { EventRepository, RoutineRepository } from './repository';

export interface Repositories {
  events: EventRepository;
  routines: RoutineRepository;
}

let cached: Repositories | null = null;

export async function createRepositories(): Promise<Repositories> {
  if (cached) return cached;
  const { InMemoryEventRepository, InMemoryRoutineRepository } = await import('./repository');
  cached = {
    events: new InMemoryEventRepository(),
    routines: new InMemoryRoutineRepository(),
  };
  return cached;
}
