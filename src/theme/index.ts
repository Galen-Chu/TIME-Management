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

/**
 * 字體方案(2026-11-24 介面 Uniconsign 化拍板):
 * 拉丁文 Karla → **Inter**(Uniconsign 定案);中文維持 **Noto Sans TC**
 * (2026-08-25 Phase 5 拍板:繁中完整、含 SemiBold 600,與 Uniconsign 相同)。
 */
import { Platform } from 'react-native';

const STACK = (f: string) =>
  Platform.OS === 'web' ? `${f}, 'Noto Sans TC', sans-serif` : f;

export const font = {
  /** Noto Sans TC — 主字體(繁中完整+全字重) */
  rounded: {
    medium: STACK('NotoSansTC-Medium'),
    semibold: STACK('NotoSansTC-SemiBold'),
    bold: STACK('NotoSansTC-Bold'),
  },
  /** Inter — 拉丁文/數字 */
  latin: {
    regular: STACK('Inter-Regular'),
    medium: STACK('Inter-Medium'),
    semibold: STACK('Inter-SemiBold'),
    bold: STACK('Inter-Bold'),
  },
} as const;

/** Uniconsign shadow token 的 RN 換算(卡片 sm、Toast lg、表單向上) */
export const shadow = {
  card: {
    shadowColor: '#1A1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  toast: {
    shadowColor: '#1A1917',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#1A1917',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
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
