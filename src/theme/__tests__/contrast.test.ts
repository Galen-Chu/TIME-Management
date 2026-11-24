/**
 * 類別色可辨識性(2026-11-24 介面 Uniconsign 化的驗收條件,使用者拍板:
 * 類別色保留但須可辨識):
 * 1. 白字(事件塊/徽章文字)對每個類別色 ≥ 4.5:1(WCAG AA 一般文字)
 * 2. 兩兩類別色 ΔE76 ≥ 15(色相軸相異之下限;清單/表單另有徽章字與名稱作冗餘線索)
 * 3. 核心文字對比 ≥ 4.5:1
 */
import tokens from '../tokens.json';

const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const chan = (hex: string) => [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
const lum = (hex: string) => {
  const [r, g, b] = chan(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const fLab = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const lab = (hex: string) => {
  const [r, g, b] = chan(hex);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  return [116 * fLab(Y) - 16, 500 * (fLab(X) - fLab(Y)), 200 * (fLab(Y) - fLab(Z))];
};
const deltaE = (a: string, b: string) => {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

const category = tokens.color.category as Record<string, string>;

describe('類別色可辨識性', () => {
  it('白字對每個類別色 ≥ 4.5:1(WCAG AA)', () => {
    for (const hex of Object.values(category)) {
      expect(contrast('#FFFFFF', hex)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('兩兩 ΔE76 ≥ 15', () => {
    const keys = Object.keys(category);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        expect(deltaE(category[keys[i]], category[keys[j]])).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it('核心文字對比 ≥ 4.5:1(ink / inkSecondary 對 bg 與 surface)', () => {
    for (const surface of [tokens.color.bg, tokens.color.surface]) {
      expect(contrast(tokens.color.ink, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(tokens.color.inkSecondary, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
