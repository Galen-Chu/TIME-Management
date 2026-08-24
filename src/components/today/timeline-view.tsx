/**
 * 時間軸檢視(FR-TOD 1):24 小時垂直時間軸。
 * 每小時 40px、每 2 小時刻度;事件塊已確認=實心底白字、
 * 預測=類別色 22% 底+2px 虛線框+類別色字;現在線 2px accent+圓點+時間標籤。
 */
import { StyleSheet, Text, View } from 'react-native';

import type { CategoryKey } from '../../domain/categories';
import { formatClock } from '../../i18n/format';
import { MOCK_NOW, type MockEvent } from '../../mock/today';
import { categoryColor, categoryFaded, color, font, timeline } from '../../theme';

const H = timeline.pxPerHour;

export function TimelineView({ events }: { events: MockEvent[] }) {
  const nowY = MOCK_NOW * H;
  return (
    <View style={styles.wrap}>
      <View style={styles.scroll}>
        {/* 小時刻度 */}
        {Array.from({ length: 13 }, (_, i) => i * 2).map((h) => (
          <View key={h} style={[styles.tick, { top: h * H }]}>
            <Text style={styles.tickText}>{String(h).padStart(2, '0')}:00</Text>
          </View>
        ))}
        {/* 背景格線 */}
        <View style={[styles.grid, { height: 24 * H }]} />

        {/* 事件塊 */}
        {events.map((e) => (
          <EventBlock key={e.id} event={e} />
        ))}

        {/* 現在線 */}
        <View style={[styles.now, { top: nowY }]}>
          <View style={styles.nowDot} />
          <View style={styles.nowLine} />
          <Text style={styles.nowLabel}>{formatClock(MOCK_NOW)}</Text>
        </View>
      </View>
    </View>
  );
}

function EventBlock({ event }: { event: MockEvent }) {
  const c = categoryColor(event.category);
  const top = event.start * H;
  const height = Math.max((event.end - event.start) * H - 2, 20);
  return (
    <View
      accessibilityLabel={event.labelZh}
      style={[
        styles.event,
        {
          top,
          height,
          backgroundColor: event.predicted ? categoryFaded(event.category) : c,
          borderColor: c,
          borderStyle: event.predicted ? 'dashed' : 'solid',
        },
      ]}
    >
      <Text
        style={{
          color: event.predicted ? c : '#FFFFFF',
          fontSize: 13,
          fontFamily: font.rounded.semibold,
        }}
        numberOfLines={1}
      >
        {event.labelZh}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  scroll: { height: 24 * H, marginLeft: 4, marginRight: 12 },
  grid: {
    position: 'absolute',
    left: timeline.leftGutter - 8,
    right: 0,
    top: 0,
    borderWidth: 0.5,
    borderColor: color.divider,
  },
  tick: { position: 'absolute', left: 0, top: 0, height: 14 },
  tickText: {
    width: timeline.leftGutter - 14,
    textAlign: 'right',
    fontSize: 11,
    color: color.inkMuted,
    fontFamily: font.karla.regular,
    fontVariant: ['tabular-nums'],
  },
  event: {
    position: 'absolute',
    left: timeline.leftGutter,
    right: 0,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  now: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.accent },
  nowLine: { flex: 1, height: 2, backgroundColor: color.accent },
  nowLabel: {
    position: 'absolute',
    left: timeline.leftGutter + 6,
    top: -16,
    fontSize: 12,
    fontFamily: font.rounded.bold,
    color: color.accent,
    fontVariant: ['tabular-nums'],
  },
});
