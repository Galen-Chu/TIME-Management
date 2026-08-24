/**
 * Design tokens — 單一事實來源為 tokens.json(DESIGN-SPEC.md 同步維護)。
 * 本檔只做型別化輸出與 RN 版本的陰影/字體換算,禁止出現 token 以外的魔法數字。
 */
import tokens from './tokens.json';

export const color = tokens.color;
export const fontSize = tokens.font.size;
export const radius = tokens.radius;
export const timeline = tokens.timeline;
export const clock = tokens.clock;

export const fontFamily = tokens.font.family
  .replace(/'/g, '')
  .split(',')
  .map((f) => f.trim())
  .filter(Boolean);

/** 主要字體(依載入的 Google Fonts 實名)。
 * 注意:M PLUS Rounded 1c 家族無 600 SemiBold,semibold 以 700 替代。
 * 字型涵蓋:M PLUS Rounded 1c 為日文字型,部分繁中字(如「溫」「你」)缺字;
 * web 端以 Noto Sans TC 作回落(由 _layout 注入 Google Fonts 連結),
 * native 端缺字自動回落系統字型。 */
import { Platform } from 'react-native';

const STACK = (f: string) =>
  Platform.OS === 'web' ? `${f}, 'Noto Sans TC', sans-serif` : f;

export const font = {
  /** M PLUS Rounded 1c — 標題/中文優先 */
  rounded: {
    medium: STACK('MPLUSRounded1c-Medium'),
    semibold: STACK('MPLUSRounded1c-Bold'),
    bold: STACK('MPLUSRounded1c-Bold'),
  },
  /** Karla — 拉丁文內文 */
  karla: {
    regular: STACK('Karla-Regular'),
    medium: STACK('Karla-Medium'),
    semibold: STACK('Karla-SemiBold'),
    bold: STACK('Karla-Bold'),
  },
} as const;

export const shadow = {
  card: {
    shadowColor: 'rgba(60,45,30,1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  toast: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
} as const;

export const spacing = {
  screenH: 20, // 畫面左右留白
  cardPadding: 16,
  rowGap: 10,
  sectionGap: 8,
} as const;

/** 類別色便捷存取 */
export function categoryColor(key: string): string {
  return (color.category as Record<string, string>)[key] ?? color.ink;
}

/** 類別色淡底(預測樣式用) */
export function categoryFaded(key: string, alpha = 0.22): string {
  const hex = categoryColor(key).replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
