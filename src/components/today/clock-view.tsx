/**
 * 時鐘盤檢視(FR-TOD 2):250px 圓形 24 小時刻度盤,
 * 依事件起訖以 SVG 弧段填類別色;中央 170px 奶油圓顯示時間與目前活動;
 * 指針以 24h 比例旋轉(0 點 = -90° 起);下方雙欄圖例(類別時數)。
 */
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CATEGORY_KEYS, categoryLabelKey, type CategoryKey } from '../../domain/categories';
import { formatClock, formatHours } from '../../i18n/format';
import { currentLanguage, useSettings } from '../../state/settings';
import { MOCK_NOW, type MockEvent } from '../../mock/today';
import { categoryColor, clock, color, font } from '../../theme';

const R = clock.diameter / 2;
const INNER_R = clock.innerDiameter / 2; // 85
// 環帶幾何:外緣不得超過 SVG 畫布半徑(125),否則左右上下會被裁平
const STROKE = 36;
const RING_R = INNER_R + 18; // 103;外緣 103+18=121 ≤ 125,內緣 85 = 內圈相接

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
      strokeLinecap="round"
      fill="none"
    />
  );
}

export function ClockView({ events }: { events: MockEvent[] }) {
  const { t } = useTranslation();
  const settings = useSettings((s) => s.settings);
  const lang = currentLanguage(settings);

  const current =
    events.find((e) => !e.predicted && MOCK_NOW >= e.start && MOCK_NOW < e.end) ?? null;

  // 圖例時數(依 mock events 計算,雙欄)
  const totals = new Map<CategoryKey, number>();
  events
    .filter((e) => !e.predicted)
    .forEach((e) => totals.set(e.category, (totals.get(e.category) ?? 0) + (e.end - e.start)));
  const legend = CATEGORY_KEYS.filter((k) => totals.has(k)).map((k) => ({
    key: k,
    hours: totals.get(k) ?? 0,
  }));

  const needleDeg = (MOCK_NOW / 24) * 360;

  return (
    <View style={styles.wrap}>
      <View style={styles.dialWrap}>
        <Svg width={clock.diameter} height={clock.diameter}>
          {/* 底環 */}
          <Circle
            cx={R}
            cy={R}
            r={RING_R}
            stroke={color.track}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* 事件段 */}
          {events
            .filter((e) => !e.predicted)
            .map((e) => (
              <Segment
                key={e.id}
                start={e.start}
                end={e.end}
                catColor={categoryColor(e.category)}
              />
            ))}
          {/* 指針(0 點 = 上方) */}
          <G rotation={needleDeg} origin={`${R},${R}`}>
            <Line
              x1={R}
              y1={R}
              x2={R}
              y2={R - clock.innerDiameter / 2 + 8}
              stroke={color.ink}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerTime}>{formatClock(MOCK_NOW)}</Text>
          <Text style={styles.centerActivity} numberOfLines={2}>
            {current
              ? t('today.currentActivity') + ' · ' + current.labelZh
              : t('today.noActivity')}
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '50%' },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: color.inkSecondary, fontFamily: font.rounded.medium },
});
