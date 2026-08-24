/** 視圖共用小工具(blocks-view 用) */
export { durationOf, type Event } from '../../domain/events';
import { formatRange as fmt } from '../../i18n/format';
import type { Event as Ev } from '../../domain/events';
export function formatRangeSafe(e: Pick<Ev, 'start' | 'end'>): string {
  return fmt(e.start, e.end);
}
