/**
 * Detection 服務(ARCHITECTURE §AI Services)。
 *
 * 介面 + 停留判定純函式。實際 geofence/位置存取由 expo-location 提供,
 * Phase 4 以介面+模擬模式先行(native geofence 需 dev client,Phase 5 接入)。
 * 原始軌跡只在記憶體/裝置端使用(NFR-1)。
 */
import type { CategoryKey } from '../domain/categories';

/** 停留判定參數(原型:45 分鐘) */
export const DWELL_MIN_MINUTES = 45;
export const DWELL_RADIUS_M = 100;

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface DwellCandidate {
  placeName: string;
  minutes: number;
  categoryGuess: CategoryKey;
  startTime: number; // epoch ms
  endTime: number;
}

/** 兩點距離(Haversine,公尺) */
export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * 停留判定:連續位置點在半徑 DWELL_RADIUS_M 內停留 ≥ N 分鐘 → 候選。
 * 純函式:接收軌跡,輸出候選(不存原始軌跡)。
 */
export function detectDwell(
  points: LocationPoint[],
  placeName: string,
  categoryGuess: CategoryKey,
  radiusM = DWELL_RADIUS_M,
  minMinutes = DWELL_MIN_MINUTES
): DwellCandidate | null {
  if (points.length < 2) return null;

  const anchor = points[0];
  const startTime = anchor.timestamp;
  let lastInRadius = anchor;

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (distanceM(anchor, p) <= radiusM) {
      lastInRadius = p;
    } else {
      // 離開半徑:檢查停留時間
      const minutes = (lastInRadius.timestamp - startTime) / 60000;
      if (minutes >= minMinutes) {
        return {
          placeName,
          minutes: Math.round(minutes),
          categoryGuess,
          startTime,
          endTime: lastInRadius.timestamp,
        };
      }
      // 重錨定
      return detectDwell(points.slice(i), placeName, categoryGuess, radiusM, minMinutes);
    }
  }

  // 全程在半徑內
  const minutes = (lastInRadius.timestamp - startTime) / 60000;
  if (minutes >= minMinutes) {
    return {
      placeName,
      minutes: Math.round(minutes),
      categoryGuess,
      startTime,
      endTime: lastInRadius.timestamp,
    };
  }
  return null;
}

/** DwellCandidate → Toast 訊息的 i18n 參數(FR-DTC 範本) */
export function dwellToToastParams(c: DwellCandidate): {
  place: string;
  minutes: number;
  activityKey: string;
  /** Toast 建議事件的時間(0–24) */
  eventStart: number;
  eventEnd: number;
  category: CategoryKey;
} {
  const d = new Date(c.startTime);
  const start = d.getHours() + d.getMinutes() / 60;
  const end = Math.min(new Date(c.endTime).getHours() + new Date(c.endTime).getMinutes() / 60, 24);
  return {
    place: c.placeName,
    minutes: c.minutes,
    activityKey: `toast.activity.${c.categoryGuess === 'work' ? 'work' : 'other'}`,
    eventStart: Math.round(start * 4) / 4,
    eventEnd: Math.max(Math.round(end * 4) / 4, Math.round(start * 4) / 4 + 0.25),
    category: c.categoryGuess,
  };
}
