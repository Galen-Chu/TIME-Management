/**
 * i18next 單例(ARCHITECTURE §i18n)。
 * 語言解析順序:Settings.language(手動設定)→ 系統語言 → 預設 zh-TW。
 * 插值一律 {{param}};日期/時長/百分比走 Intl(src/i18n/format.ts)。
 */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUS from './locales/en-US.json';
import zhTW from './locales/zh-TW.json';

export const SUPPORTED_LANGS = ['zh-TW', 'en-US'] as const;
export type Language = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANGUAGE: Language = 'zh-TW';

/** 系統語言對應(非 zh/en 一律 fallback zh-TW) */
export function systemLanguage(): Language {
  const locale =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language.toLowerCase()
      : '';
  if (locale.startsWith('en')) return 'en-US';
  return 'zh-TW';
}

void i18next.use(initReactI18next).init({
  lng: DEFAULT_LANGUAGE, // 啟動暫設;settings store 載入後依設定覆寫
  fallbackLng: DEFAULT_LANGUAGE,
  resources: {
    'zh-TW': { translation: zhTW },
    'en-US': { translation: enUS },
  },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18next;
