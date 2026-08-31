/**
 * 時間軸檢視(FR-TOD 1):24 小時垂直時間軸(40px/h、每 2 小時刻度)。
 * 事件塊:已確認=實心白字;預測=淡底虛線框;跨午夜拆兩塊(timelineBlocks)。
 * 現在線 = 即時時刻(nowHours)。點事件塊 → onSelect;點空白 → onCreate(tapY→小時)。
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { timelineBlocks, nowHours, snap, type Event } from '../../domain/events';
import { formatClock } from '../../i18n/format';
import { categoryColor, categoryFaded, color, font, timeline } from '../../theme';

const H = timeline.pxPerHour;

interface Props {
  events: Event[];
  /** 即時時刻(由父層 useNow 驅動,現在線才會動) */
  now?: Date;
  onSelect: (e: Event) => void;
  onCreate: (start: number) => void;
}

export function TimelineView({ events, now, onSelect, onCreate }: Props) {
  const { t } = useTranslation();
  const nowH = nowHours(now);
  const nowY = nowH * H;

  return (
    <View style={styles.wrap}>
      <View style={styles.scroll}>
        {Array.from({ length: 13 }, (_, i) => i * 2).map((h) => (
          <View key={h} style={[styles.tick, { top: h * H }]}>
            <Text style={styles.tickText}>{formatClock(h)}</Text>
          </View>
        ))}
        <View style={[styles.grid, { height: 24 * H }]} />

        {/* 點空白新增:覆蓋整軸的下層按壓層 */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('today.addEvent')}
          style={[styles.tapLayer, { height: 24 * H }]}
          onPress={(e) => {
            const n = e.nativeEvent as { locationY?: number; offsetY?: number; layerY?: number; pageY?: number };
            // RN-native 提供 locationY;RN-web 提供 offsetY/layerY
            const y = n.locationY ?? n.offsetY ?? n.layerY;
            const hour = y != null && y >= 0 ? snap(y / H) : snap(nowH);
            onCreate(hour);
          }}
        />

        {events.map((e) =>
          timelineBlocks(e).map((b, bi) => (
            <EventBlock key={`${e.id}-${bi}`} event={e} block={b} onSelect={onSelect} />
          ))
        )}

        <View style={[styles.now, { top: nowY }]}>
          <View style={styles.nowDot} />
          <View style={styles.nowLine} />
          <Text style={styles.nowLabel}>{formatClock(nowH)}</Text>
        </View>
      </View>
    </View>
  );
}

function EventBlock({
  event,
  block,
  onSelect,
}: {
  event: Event;
  block: { start: number; hours: number; tail: boolean };
  onSelect: (e: Event) => void;
}) {
  const c = categoryColor(event.category);
  const top = block.start * H;
  const height = Math.max(block.hours * H - 2, 20);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={event.label}
      onPress={() => onSelect(event)}
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
        {event.label}
      </Text>
    </Pressable>
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
  tapLayer: { position: 'absolute', left: timeline.leftGutter, right: 0, top: 0 },
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
