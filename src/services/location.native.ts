/**
 * 位置偵測服務——native 實作(expo-location)。
 * 前景 watchPosition(約 1 分鐘/25m)→ 記憶體滾動軌跡(上限 90 點)
 * → detectDwell 停留判定(45 分鐘/100m,純函式)→ onDwell。
 *
 * NFR-1(隱私):原始軌跡僅存在記憶體滾動緩衝,不持久化、不上傳;
 * 停留成立後僅對「當前單點」做反向地理編碼取地點名(失敗回空字串,UI 顯示 fallback)。
 * 背景執行(geofence/foreground service)需 dev client——後續階段接入。
 */
import * as Location from 'expo-location';

import { detectDwell, type LocationPoint } from './detection';
import type { LocationService } from './location';

const MAX_POINTS = 90; // 滾動窗口(約 90 分鐘)
const WATCH_INTERVAL_MS = 60_000;
const WATCH_DISTANCE_M = 25;

let subscription: Location.LocationSubscription | null = null;
let points: LocationPoint[] = [];

async function resolvePlaceName(
  coords: { latitude: number; longitude: number }
): Promise<string> {
  try {
    const hits = await Location.reverseGeocodeAsync(coords);
    const h = hits[0];
    return h?.name || h?.street || h?.district || h?.city || '';
  } catch {
    return '';
  }
}

export const locationService: LocationService = {
  async start({ onDwell }) {
    if (subscription) return true;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: WATCH_INTERVAL_MS,
        distanceInterval: WATCH_DISTANCE_M,
      },
      (loc) => {
        points.push({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          timestamp: loc.timestamp,
        });
        if (points.length > MAX_POINTS) points = points.slice(-MAX_POINTS);

        const candidate = detectDwell(points, '', 'other');
        if (!candidate) return;
        points = points.slice(-2); // 判定成立後重置窗口,避免連續重複觸發
        void (async () => {
          const place = await resolvePlaceName(loc.coords);
          onDwell({ ...candidate, placeName: place });
        })();
      }
    );
    return true;
  },

  stop() {
    void subscription?.remove();
    subscription = null;
    points = [];
  },
};
