/**
 * 位置偵測服務連接埠——web 實作(no-op)。
 * web 無位置偵測:Today 螢幕以示範模式呈現偵測流程。
 * native 實作見 location.native.ts(expo-location 前景監看)。
 */
import type { DwellCandidate } from './detection';

export interface LocationCallbacks {
  /** 偵測到停留 ≥ 45 分鐘(FR-DTC) */
  onDwell: (candidate: DwellCandidate) => void;
}

export interface LocationService {
  /** 請求權限並開始前景監看;回傳是否成功啟動 */
  start: (cb: LocationCallbacks) => Promise<boolean>;
  stop: () => void;
}

export const locationService: LocationService = {
  async start() {
    return false; // web:無位置偵測
  },
  stop() {},
};
