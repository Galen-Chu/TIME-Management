/**
 * 時鐘盤檢視(FR-TOD 2):250px 24h 刻度盤(SVG 弧段)、中央奶油圓、即時指針、雙欄圖例。
 */
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CATEGORY_KEYS, categoryLabelKey, type CategoryKey } from '../../domain/categories';
import { durationOf, hoursByCategory, nowHours, type Event } from '../../domain/events';
import { formatClock, formatHours } from '../../i18n/format';
import { currentLanguage, useSettings } from '../../state/settings';
import { categoryColor, clock, color, font } from '../../theme';

const R = clock.diameter / 2;
const INNER_R = clock.innerDiameter / 2; // 85
// 環帶幾何:外緣不得超過 SVG 畫布半徑(125),否則會被裁平
const STROKE = 36;
const RING_R = INNER_R + 18; // 103;外緣 103+18=121 ≤ 125

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** 24h 環上 [start, end) 小時的弧路徑(0 點 = 正上方,順時針) */
function arcPath(start: number, end: number, r: number): string {
  const a1 = (start / 24) * 360 - 90;
  const a2 = (end / 24) * 360 - 90;
  const p1 = polar(R, R, r, a1);
  const p2 = polar(R, R, r, a2);
  const largeArc = a2 - a1 > 180 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

function Segment({ start, end, catColor }: { start: number; end: number; catColor: string }) {
  return (
    <Path
      d={arcPath(start, end, RING_R)}
      stroke={catColor}
      strokeWidth={STROKE}
      strokeLinecap="butt"
      fill="none"
    />
  );
}

export function ClockView({ events }: { events: Event[] }) {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);
  const now = nowHours();

  const confirmed = events.filter((e) => !e.predicted);
  const current =
    confirmed.find((e) => now >= e.start && now < e.end) ??
    // 跨午夜:23-2 在 01:00 進行中
    confirmed.find((e) => e.end < e.start && (now >= e.start || now < e.end)) ??
    null;

  const totals = hoursByCategory(confirmed);
  const legend = CATEGORY_KEYS.filter((k) => totals[k]).map((k) => ({
    key: k,
    hours: totals[k] ?? 0,
  }));

  const needleDeg = (now / 24) * 360;

  return (
    <View style={styles.wrap}>
      <View style={styles.dialWrap}>
        <Svg width={clock.diameter} height={clock.diameter}>
          <Circle cx={R} cy={R} r={RING_R} stroke={color.track} strokeWidth={STROKE} fill="none" />
          {confirmed.map((e) => (
            <Segment key={e.id} start={e.start} end={e.end} catColor={categoryColor(e.category)} />
          ))}
          <G rotation={needleDeg} origin={`${R},${R}`}>
            <Line
              x1={R}
              y1={R}
              x2={R}
              y2={R - INNER_R + 8}
              stroke={color.ink}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerTime}>{formatClock(now)}</Text>
          <Text style={styles.centerActivity} numberOfLines={2}>
            {current ? `${t('today.currentActivity')} · ${current.label}` : t('today.noActivity')}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        {legend.map((l) => (
          <View key={l.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: categoryColor(l.key) }]} />
            <Text style={styles.legendText}>
              {t(categoryLabelKey(l.key))} {formatHours(l.hours, lang)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 16 },
  dialWrap: { width: clock.diameter, height: clock.diameter, alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    width: clock.innerDiameter,
    height: clock.innerDiameter,
    borderRadius: clock.innerDiameter / 2,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerTime: { fontSize: 26, fontFamily: font.rounded.semibold, color: color.ink, fontVariant: ['tabular-nums'] },
  centerActivity: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: font.rounded.medium,
    color: color.inkSecondary,
    textAlign: 'center',
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingHorizontal: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '50%' },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: color.inkSecondary, fontFamily: font.rounded.medium },
});
