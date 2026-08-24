/**
 * Settings store(Zustand + AsyncStorage persist)。
 * 資料模型見 ARCHITECTURE §Data Model;Phase 2 起遷移 SQLite,
 * store 保持單一介面以免呼叫端改動。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { clampLeadTime, wrapSleep } from '../domain/invariants';
import i18n, { DEFAULT_LANGUAGE, systemLanguage, type Language } from '../i18n';

export { clampLeadTime, wrapSleep };

export interface Settings {
  language: Language | null; // null = 未手動選擇,跟隨系統
  sleepStart: number; // 0–24,步階 0.25
  sleepEnd: number;
  flexEnabled: boolean;
  irregularMode: boolean;
  sensitivity: 0 | 1 | 2; // 低/中/高
  leadTime: number; // 5–30,步階 5
  notifyStyle: 'gentle' | 'push';
  quietHoursOn: boolean;
  onboardingDone: boolean;
}

interface SettingsStore {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  finishOnboarding: () => void;
  setLanguage: (lang: Language) => void;
}

const DEFAULTS: Settings = {
  language: null,
  sleepStart: 23,
  sleepEnd: 7,
  flexEnabled: false,
  irregularMode: false,
  sensitivity: 1,
  leadTime: 15,
  notifyStyle: 'gentle',
  quietHoursOn: true,
  onboardingDone: false,
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      update: (patch) => {
        if (patch.leadTime != null) patch.leadTime = clampLeadTime(patch.leadTime);
        if (patch.sleepStart != null) patch.sleepStart = wrapSleep(patch.sleepStart);
        if (patch.sleepEnd != null) patch.sleepEnd = wrapSleep(patch.sleepEnd);
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },
      finishOnboarding: () =>
        set((s) => ({ settings: { ...s.settings, onboardingDone: true } })),
      setLanguage: (lang) => {
        void i18n.changeLanguage(lang);
        set((s) => ({ settings: { ...s.settings, language: lang } }));
      },
    }),
    {
      name: 'timecare-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // 持久化載入後同步 i18n(手動選擇 > 系統 > 預設)
        const lang = state?.settings.language ?? systemLanguage();
        void i18n.changeLanguage(lang);
      },
    }
  )
);

/** 現行生效語言 */
export function currentLanguage(s: Settings): Language {
  return s.language ?? DEFAULT_LANGUAGE;
}
