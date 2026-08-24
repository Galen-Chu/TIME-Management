/**
 * 類別領域常數(固定 7 類;label 走 i18n、色碼走 token,不入庫)。
 * 徽章方案(2026-08-24 Phase 1 拍板,I18N.md 設計延伸§2):兩語一致——
 * 以「類別色圓角方塊」為徽章,不使用文字徽章,零在地化成本。
 */
export type CategoryKey =
  | 'work'
  | 'sleep'
  | 'meal'
  | 'exercise'
  | 'leisure'
  | 'commute'
  | 'other';

export const CATEGORY_KEYS: readonly CategoryKey[] = [
  'work',
  'sleep',
  'meal',
  'exercise',
  'leisure',
  'commute',
  'other',
] as const;

/** i18n key:`categories.work` …(見 I18N.md 對照樣張) */
export function categoryLabelKey(key: CategoryKey): string {
  return `categories.${key}`;
}
