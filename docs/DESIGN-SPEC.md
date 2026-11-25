# 🎨 Design Spec · 設計規格

> 視覺 token 依據（2026-11-24 起）：**[Uniconsign v0.2.0](https://github.com/Galen-Chu/Uniconsign)**——Galen Chu 的個人品牌設計系統，原始檔 vendor 於 `src/theme/uniconsign/`（primitives + semantic，含深色模式成對值）。互動規格依據：Claude Design 原型「24小時時間管理APP」（https://claude.ai/design/p/63891dbe-d2bd-46bc-b064-816c5dfb08f3?file=TimeCare.dc.html ，需專案擁有者權限，iOS 框 402×874）。原型仍為**互動**最終依據；**視覺**以本文件（= Uniconsign）為準，不一致時先修本文件再修程式。

---

## 🎨 Color · 色彩系統

### 核心色

| 語意 | Token | 色碼 | Uniconsign 對應 | 用途 |
|---|---|---|---|---|
| 背景暖白 | `bg` | `#F7F7F5` | neutral.50（bg.canvas） | 全域底色、時鐘盤內圈、事件表單底 |
| 卡片底 | `surface` | `#FFFFFF` | neutral.0（bg.surface） | 卡片、錯誤橫幅 |
| 主要文字 | `ink` | `#1A1917` | neutral.900（text.primary） | 標題、作用中分段、主要按鈕底、Toast 底 |
| 次要文字 | `inkSecondary` | `#5A574F` | neutral.600（text.secondary） | 說明文字、區塊標題、非作用中分段文字 |
| 弱化文字 | `inkMuted` | `#9C9890` | neutral.400（text.disabled） | 時間刻度、meta |
| 強調（品牌綠） | `accent` | `#167839` | brand.600（bg.brand） | 現在線、Toast 脈動點、Onboarding 進度點、分頁作用點 |
| 強調亮 | `accentLight` | `#96D4A2` | brand.300 | Onboarding 色塊漸層起點、Toast 動作文字 |
| 成功／開啟 | `success` | `#167839` | brand.600（status.success） | 開啟中開關、已完成勾選、涵蓋率進度條 |
| 成功亮 | `successLight` | `#BBE6C3` | brand.200 | Onboarding 步驟漸層收尾 |
| 警告 | `warning` | `#796900` | yellow.700（status.warning） | 預留（黃色淺底文字需 ≥AA，故取 700） |
| 危險 | `danger` | `#C8423B` | red.600（status.danger） | 錯誤橫幅左框與關閉 icon |
| 資訊 | `info` | `#007687` | cyan.600（status.info） | 預留 |
| 分段軌道 | `track` | `#EEEDEA` | neutral.100（bg.sunken） | 分段控制底、步進器圓鈕底 |
| 軌道次 | `trackAlt` | `#C4C1BA` | neutral.300 | 關閉中開關、未完成勾選框、把手 |
| 分隔線 | `divider` | `#DEDCD7` | neutral.200（border.default） | 卡片邊框、Tab bar 上緣 |
| 圖表軌道 | `trackSoft` | `#EEEDEA` | neutral.100 | 類別分佈條底、洞察分隔線 |
| 步進器符號 | `stepperInk` | `#6E5C7E` | 類別延伸（同睡眠紫） | 步進器 −／＋ 符號 |

> 深色模式：Uniconsign semantic 層內建深淺成對值（vendor 檔 `$extensions.mode.dark`），本期 App 維持淺色（`userInterfaceStyle: light`）；啟用深色時以 vendor 值對映即可，類別色需另推導深色變體（下期）。

### 類別色（7 類，App 自有資料色）

| Key | 中文 | 英文 | 色碼 | 徽章字 | 相對原型 |
|---|---|---|---|---|---|
| `work` | 工作 | Work | `#B26047` | 工 | 原 `#E2795A` 同色相加深 |
| `sleep` | 睡眠 | Sleep | `#6E5C7E` | 眠 | 不變 |
| `meal` | 用餐 | Meals | `#9A6E1F` | 食 | 原 `#D9A441` 同色相加深 |
| `exercise` | 運動 | Exercise | `#4E7A57` | 動 | 原 `#7C9473` 加深＋增飽和 |
| `leisure` | 休閒 | Leisure | `#A4656C` | 閒 | 原 `#C97B84` 同色相加深 |
| `commute` | 通勤 | Commute | `#4D6375` | 行 | 原 `#A79B8E` 暖灰改**石板藍**（色相分離） |
| `other` | 其他 | Other | `#7D7267` | 他 | 原 `#B7A99A` 同色相加深 |

**可辨識性驗證**（2026-11-24，使用者條件「保留但須可辨識」，自動化於 `src/theme/__tests__/contrast.test.ts`）：

| 檢查 | 原調色盤 | 現調色盤 |
|---|---|---|
| 白字對比（事件塊/徽章） | 2.25–6.01，僅睡眠達 4.5:1 | **7 類全數 ≥ 4.5:1（4.51–6.26）** |
| 兩兩 ΔE76 最差對 | **5.5**（通勤↔其他，近同色） | **18.2**（睡眠↔通勤，紫/藍異色相） |

- 深色化會壓縮明度差，故同時拉開色相軸：綠更綠（運動）、藍更藍（通勤）、暖灰更棕（其他）。
- 徽章字與清單名稱始終與色塊並列，色彩為冗餘線索而非唯一辨識依據。

---

## 🔤 Typography · 字體排印

字體家族：**Inter**（拉丁文與數字，Uniconsign 定案）＋ **Noto Sans TC**（中日韓，weight 500/600/700），fallback `Inter → Noto Sans TC → PingFang TC → Microsoft JhengHei → sans-serif`。載入走 `@expo-google-fonts/inter` 與 `@expo-google-fonts/noto-sans-tc`（2026-08-25 起不再載入 M PLUS Rounded 1c——日文字型繁中粗體缺字；Karla 已於 2026-11-24 由 Inter 取代）。

| 層級 | Token | 大小 | weight | 用途 |
|---|---|---|---|---|
| 頁面大標 | `pageTitle` | 34px（3xl） | 600 | 「今天」「統計分析」等分頁標題 |
| 引導標題 | `onboardTitle` | 28px（2xl） | 600 | Onboarding 標題、時鐘盤中央時間 |
| 統計數字 | `stat` | 22px（xl） | 700 | 「今日已完成工作」等統計卡數字 |
| 表單標題 | `sheetTitle` | 22px（xl） | 600 | 事件表單標題 |
| 內文/卡片標題 | `body` | 16px（md） | 600 | 清單項目名稱、卡片標題 |
| 次要說明 | `secondary` | 14px（sm） | — | 說明文字、圖例 |
| 輔助 | `caption` | 12px（xs） | — | 時間範圍、meta、streak |
| 微字 | `micro` | 12px（xs） | 600 | Tab 標籤、刻度、按鈕內小提示 |

> 字級級數對齊 Uniconsign primitives（12/14/16/18/22/28/34/44，16 基準約 1.2 倍）。畫面元件內既有 hardcoded 字級（如步進器值 17–18px）於維護時逐步收斂至級數。

行高慣例：標題 1.15–1.25、內文 1.35–1.4、說明 1.6–1.7（Uniconsign：中文內文刻意 1.7）。

---

## 📐 Shape · 圓角、陰影、間距

- **圓角**（對映 Uniconsign radius：sm 4／md 8／lg 12／xl 20／full）：卡片 20（xl）、清單列 12（lg）、事件塊 12（lg）、按鈕 12（lg）、藥丸/開關 100（full）、表單上緣 20（xl）、色條 4–7px
- **陰影**（Uniconsign shadow sm/lg，色 `rgb(26 25 23 / …)`）：卡片 `0 1px 3px @0.07`（RN elevation 2）；Toast `0 16px 40px @0.12`（elevation 8）；表單向上 `0 -4px 16px @0.12`（elevation 8）；開關圓鈕 `0 1px 3px rgba(0,0,0,0.2)`
- **邊框**：細 1px（`divider`）、強調 1.5px（預測卡、類別膠囊）、預測虛線 2px dashed（類別色）
- **間距**（4px 基準）：畫面左右留白 20（space-5）；卡片 padding 16（space-4）；清單列間距 12（space-3）；區塊標題與內容 8（space-2）
- **時間軸幾何**（原型互動規格，不變）：每小時 40px（24h＝960px）、左側刻度欄寬 44px、事件內縮 10px padding

---

## 🧩 Components · 元件規格

| 元件 | 規格摘要 |
|---|---|
| 分段控制 Segmented | 藥丸容器（`track` 底、radius 100、padding 3）；作用中：`ink` 實底＋`bg` 文字 700；非作用中：`inkSecondary` 文字 600 |
| 步進器 Stepper | 28px 圓鈕（`track` 底、`stepperInk` 符號 −／＋，符號走 Inter）；值最小寬 56–64px 置中；睡眠 ±0.25h 環繞 24h；提前時間 ±5min 夾限 5–30 |
| 開關 Toggle | 44×26 軌道（開 `success`＝品牌綠／關 `trackAlt`）；22px 白色圓鈕（開 left 20／關 left 2） |
| 統計卡 Card | `surface` 白底、radius 20、padding 16、卡片陰影 |
| 類別膠囊 Chip | 藥囊選擇器：選中＝類別色實底白字；未選＝`surface` 底＋1.5px 類別色框＋類別色字 |
| 事件塊（時間軸） | 已確認＝類別色實底＋白字；預測＝`rgba(色,0.22)` 底＋2px 虛線框＋類別色字 |
| 現在線 NowLine | 2px `accent`（品牌綠）橫線＋10px 圓點＋左側粗體時間標籤 |
| 時鐘盤 ClockDial | 250px SVG 環帶（弧段依事件起訖填類別色）；170px 內圈 `bg`；中央時間 28px＋目前活動 12px；「現在」= 2px `ink` 徑向刻度線於環帶上（內緣→外緣，0 點 = -90deg 起，依 24h 比例旋轉；端點以極座標計算，不用 transform/origin——web 端會觸發 React 19 警告） |
| 週堆疊條 WeekBar | 每日 14px 高、radius 7；分段寬度=類別佔比%；今天標籤 700 `ink`，其餘 `inkMuted` |
| 例行列 RoutineRow | 26px 勾選圓（完成 `success`＋Uniconsign `IconCheck` 白色 14px／未完 `trackAlt`）；名稱＋「連續 N 天 · 約 HH:MM」；完成者名稱轉 `inkSecondary` |
| 偵測通知 Toast | 頂部深色（`ink`）卡 radius 12；左側 `accent` 圓點 1.6s 脈動；兩動作：`accentLight` 粗體「查看並確認」／半透明「稍後再說」 |
| 錯誤橫幅 ErrorBanner | `surface` 底、左框 3px `danger`、關閉＝Uniconsign `IconClose`（`danger`）；radius 12 |
| 事件表單 Sheet | 遮罩 `rgba(26,25,23,0.4)`；面板 `bg` 底上緣 radius 20、把手 36×4 `trackAlt`；刪除（次要 1 份寬）/確認（主要 2 份寬）按鈕 |
| Onboarding 色塊 | 150px 有機形（不對稱 border-radius）、三步漸層＝Uniconsign 品牌三色（綠 brand.300→600、青 cyan.200→600、黃 yellow.300→600）；進度點 7px、作用中拉長 22px 轉 `accent` |
| Tab Bar | `surface` 白底 90% 透明＋上緣 1px `divider`；每分頁＝7px 圓點（作用 `accent`／否則透明）＋12px 標籤（作用 `ink`／否則 `inkMuted`） |

### Icon（Uniconsign vendor）

`src/components/ui/icon.tsx` 內嵌上游 SVG path（24×24 網格、2px 外框），以 react-native-svg 渲染、fill 走參數。已同步：`check`（例行列勾選）、`close`（錯誤橫幅）。上游僅 13 個 UI icon（八向箭頭/勾/關閉/開啟），尚未涵蓋 +/− 等符號——步進器與「＋ 新增」維持文字符號；需要新 icon 時**先加進 Uniconsign 再同步過來**（單一來源原則）。

### 動效

| 名稱 | 規格 |
|---|---|
| 脈動 pulse | opacity 1→0.55、scale 1→0.75，1.6s ease 無限循環（Toast 圓點；互動依原型） |
| Toast 進場 | translateY 10→0 + 淡入，0.35s ease（互動依原型） |
| Sheet 進場 | translateY 100%→0，0.3s ease（互動依原型） |

> Uniconsign motion token（duration fast 120/base 200/slow 320、easing standard `[0.2,0,0,1]`）已隨 vendor 檔就位，供新互動優先採用；既有進場時序維持原型規格。

---

## 🖼️ Screens · 螢幕清單

| 螢幕 | 狀態/變體 |
|---|---|
| Onboarding | 步驟 0/1/2、跳過 |
| 今天 · 時間軸 | 含預測/已確認事件、現在線 |
| 今天 · 時鐘盤 | 類別圖例、目前活動 |
| 今天 · 日誌卡 | 統計卡、例行工事、已完成、AI 預測待確認（各清單空狀態需設計） |
| 今天 · 週檢視 | 7 日堆疊條、長按互動 |
| 統計分析 | 本週/本月、四卡片 |
| 彈性調節 | 睡眠視窗、兩開關 |
| AI 預測與提醒 | 敏感度三段、提前時間、通知風格、免打擾 |
| 事件表單 Sheet | 確認模式（預測事件）/編輯模式（已確認） |
| 排程管理 | §A（DESIGN-ADDENDUM） |
| 偵測通知 Toast | 與主畫面疊加 |

### 補充設計（2026-08-18 已定案）

原型未涵蓋的三項設計已於 [DESIGN-ADDENDUM.md](./DESIGN-ADDENDUM.md) 補齊，與本規格同等效力：**排程管理畫面（§A）、空狀態（§B）、語言切換列（§C）**。類別徽章英文化方案維持 Phase 1 拍板（見 I18N.md 設計延伸）。

---

## 🧱 Design Tokens · Token 檔

實作時以此 JSON 為單一事實來源（`src/theme/tokens.json`），與本文件同步維護；值取自 Uniconsign v0.2.0：

```json
{
  "color": {
    "bg": "#F7F7F5", "surface": "#FFFFFF", "ink": "#1A1917", "inkSecondary": "#5A574F", "inkMuted": "#9C9890",
    "accent": "#167839", "accentLight": "#96D4A2",
    "success": "#167839", "successLight": "#BBE6C3",
    "warning": "#796900", "danger": "#C8423B", "info": "#007687",
    "track": "#EEEDEA", "trackAlt": "#C4C1BA", "divider": "#DEDCD7", "trackSoft": "#EEEDEA",
    "stepperInk": "#6E5C7E",
    "category": {
      "work": "#B26047", "sleep": "#6E5C7E", "meal": "#9A6E1F",
      "exercise": "#4E7A57", "leisure": "#A4656C", "commute": "#4D6375", "other": "#7D7267"
    }
  },
  "font": {
    "family": "'Inter','Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif",
    "size": { "pageTitle": 34, "onboardTitle": 28, "stat": 22, "sheetTitle": 22, "body": 16, "secondary": 14, "caption": 12, "micro": 12 }
  },
  "radius": { "card": 20, "row": 12, "eventBlock": 12, "button": 12, "pill": 100, "sheetTop": 20 },
  "shadow": {
    "card": "0 1px 3px rgba(26,25,23,0.07)",
    "toast": "0 16px 40px rgba(26,25,23,0.12)",
    "sheet": "0 -4px 16px rgba(26,25,23,0.12)"
  },
  "timeline": { "pxPerHour": 40, "leftGutter": 44, "hourMarkStep": 2 },
  "clock": { "diameter": 250, "innerDiameter": 170 }
}
```

### Uniconsign 同步約定

- `src/theme/uniconsign/{primitives,semantic}.json`：vendor 自 [Uniconsign v0.2.0](https://github.com/Galen-Chu/Uniconsign)（MIT，© Galen Chu），**逐字同步不修改**；上游改版後同步並更新版本註記（tokens.json `$description`）。
- **vendor 是刻意架構決定，非技術債**（2026-11-25 評估 npm 依賴化，結論「不做」）：GitHub Packages 安裝需 token（×EAS 建置摩擦）、套件 icon 輸出非 RN 相容（仍需 react-native-svg 轉接層）、App 語意映射層本就自維。升級條件（多專案共用／套件輸出 RN 相容 icon／改發布 npmjs 公開註冊表，任一成立）時再切依賴，詳見 CLAUDE.md。
- 語意對映（核心色表的「Uniconsign 對應」欄）是唯一換算依據；上游新增語意角色時於本文件擴充對映。
- 品牌圖示（App icon/splash/favicon）：`scripts/make-brand-icons.ps1` 以 token 色重繪幾何時鐘（墨圈＋品牌綠指針/刻度/中心點＋暖白底），重跑可再現。

---

## 📜 變更紀錄

- **2026-11-24 · 介面 Uniconsign 化**：色彩/字體/圓角/陰影/間距全面改依 Uniconsign v0.2.0（奶油陶土暖色系 → 暖白＋品牌綠系統）；類別色同色相加深至白字 4.5:1、通勤改石板藍；Karla→Inter；vendor check/close icon；品牌圖示改色。原型退居互動依據。
- 2026-08-18 · 原型轉譯定案（初版，奶油底＋陶土橘＋M PLUS Rounded 1c/Karla）。
