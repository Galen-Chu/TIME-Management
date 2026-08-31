/**
 * 共用 uid 產生器(時間戳 36 進位 + 隨機後綴,避免同毫秒碰撞)。
 * 取代各處自訂的 id 生成(其中一處僅用 timestamp,易碰撞)。
 */
export function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
