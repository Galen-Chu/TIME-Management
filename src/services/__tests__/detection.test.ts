/**
 * 偵測服務測試:距離、停留判定(45 分鐘門檻)、Toast 參數轉換。
 */
import { detectDwell, distanceM, dwellToToastParams } from '../detection';

describe('distanceM', () => {
  it('同一點 = 0', () => {
    expect(distanceM({ lat: 25.033, lng: 121.565 }, { lat: 25.033, lng: 121.565 })).toBe(0);
  });
  it('約 111km/緯度度', () => {
    const d = distanceM({ lat: 25, lng: 121 }, { lat: 26, lng: 121 });
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });
});

describe('detectDwell(45 分鐘門檻)', () => {
  const base = { lat: 25.033, lng: 121.565 };

  function track(minutes: number, jitterM = 30): Array<{ lat: number; lng: number; timestamp: number }> {
    const pts = [];
    const t0 = Date.parse('2026-08-25T09:00:00');
    for (let m = 0; m <= minutes; m += 5) {
      const rad = (jitterM / 6371000) * (Math.PI / 180);
      pts.push({
        lat: base.lat + (m % 2 === 0 ? rad : -rad),
        lng: base.lng,
        timestamp: t0 + m * 60000,
      });
    }
    return pts;
  }

  it('停留 50 分鐘 → 候選(≥45)', () => {
    const c = detectDwell(track(50), '內湖辦公室', 'work');
    expect(c).not.toBeNull();
    expect(c!.minutes).toBe(50);
    expect(c!.placeName).toBe('內湖辦公室');
  });

  it('停留 30 分鐘 → 無候選(<45)', () => {
    const c = detectDwell(track(30), '內湖辦公室', 'work');
    expect(c).toBeNull();
  });

  it('單點 → null', () => {
    expect(detectDwell([{ ...base, timestamp: 0 }], 'x', 'work')).toBeNull();
  });
});

describe('dwellToToastParams', () => {
  it('時間轉 0–24(步階 0.25)', () => {
    const c = {
      placeName: '內湖辦公室',
      minutes: 45,
      categoryGuess: 'work' as const,
      startTime: Date.parse('2026-08-25T09:10:00'),
      endTime: Date.parse('2026-08-25T09:55:00'),
    };
    const p = dwellToToastParams(c);
    expect(p.place).toBe('內湖辦公室');
    expect(p.minutes).toBe(45);
    expect(p.activityKey).toBe('toast.activity.work');
    expect(p.category).toBe('work');
    expect(p.eventStart).toBe(9.25); // 09:15 → 9.25(snap to 0.25)
  });
});
