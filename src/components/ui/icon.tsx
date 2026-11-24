/**
 * Uniconsign UI icon(24×24 網格)。vendor 自 @galen-chu/uniconsign@0.2.0
 * 的 icons/ui/*.svg(2026-11-24 同步;上游新增 icon 或改形時同步此檔)。
 * 顏色走 fill 參數(上游預設 neutral.900,即本專案 color.ink)。
 */
import Svg, { Path } from 'react-native-svg';

import { color } from '../../theme';

interface IconProps {
  /** 顯示邊長(icon 網格為 24×24) */
  size?: number;
  color?: string;
}

export function IconCheck({ size = 24, color: fill = color.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.707 11.293L10 15.586l8.293-8.293a1 1 0 0 1 1.414 1.414l-9 9a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 1.414-1.414Z"
        fill={fill}
      />
    </Svg>
  );
}

export function IconClose({ size = 24, color: fill = color.ink }: IconProps) {
  // 上游以兩個 45° 旋轉的 2px 圓角 rect 構成 X;此處以等價線段表達
  // (長 18、stroke 2、圓端點),避免 react-native-svg web 將 transform/origin
  // 轉成 kebab 屬性觸發 React 19 開發模式警告
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.64 5.64L18.36 18.36M18.36 5.64L5.64 18.36"
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
