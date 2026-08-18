# 🎨 Design Spec · 設計規格

> 轉譯來源：Claude Design 專案「24小時時間管理APP」（https://claude.ai/design/p/63891dbe-d2bd-46bc-b064-816c5dfb08f3?file=TimeCare.dc.html ，需專案擁有者權限）。原型以 iOS 裝置框（402×874，iPhone 尺寸）呈現；本文件將原型內的視覺與互動規格抽成可實作的 token。

---

## 🎨 Color · 色彩系統

### 核心色

| 語意 | Token | 色碼 | 用途 |
|---|---|---|---|
| 背景奶油 | `bg` | `#FBF5EC` | 全域底色、時鐘盤內圈、事件表單底 |
| 主要文字 | `ink` | `#2E2A25` | 標題、作用中分段、主要按鈕底、Toast 底 |
| 次要文字 | `inkSecondary` | `#8A7F72` | 說明文字、區塊標題、非作用中分段文字 |
| 弱化文字 | `inkMuted` | `#B4A99C` | 時間刻度、meta、刪除按鈕 |
| 強調 | `accent` | `#E2795A` | 現在線、Toast 脈動點、Onboarding 進度點、分頁作用點 |
| 強調亮 | `accentLight` | `#F2B79A` | Onboarding 色塊漸層起點、Toast 動作文字 |
| 成功／開啟 | `success` | `#7C9473` | 開啟中開關、已完成勾選、涵蓋率進度條 |
| 成功亮 | `successLight` | `#B9C7B0` | Onboarding 步驟 2 漸層 |
| 分段軌道 | `track` | `#F0E6D8` | 分段控制底、步進器圓鈕底 |
| 軌道次 | `trackAlt` | `#E2D9C8` | 關閉中開關、未完成勾選框、把手 |
| 分隔線 | `divider` | `#EFE6D8` | 卡片邊框、Tab bar 上緣 |
| 圖表軌道 | `trackSoft` | `#F5EFE3` | 類別分佈條底、洞察分隔線 |
| 步進器符號 | `stepperInk` | `#6E5C7E` | 步進器 −／＋ 符號（同睡眠紫） |

### 類別色（7 類，全域共用）

| Key | 中文 | 英文 | 色碼 | 徽章字 |
|---|---|---|---|---|
| `work` | 工作 | Work | `#E2795A` | 工 |
| `sleep` | 睡眠 | Sleep | `#6E5C7E` | 眠 |
| `meal` | 用餐 | Meals | `#D9A441` | 食 |
| `exercise` | 運動 | Exercise | `#7C9473` | 動 |
| `leisure` | 休閒 | Leisure | `#C97B84` | 閒 |
| `commute` | 通勤 | Commute | `#A79B8E` | 行 |
| `other` | 其他 | Other | `#B7A99A` | 他 |

> 徽章字目前為漢字（工／眠／食…）；en-US 版徽章方案見 [I18N.md](./I18N.md) 設計延伸。

---

## 🔤 Typography · 字體排印

字體家族：`M PLUS Rounded 1c`（中日韓＋標題，weight 500/600/700）＋ `Karla`（拉丁文，weight 400–700），fallback 順序 `M PLUS Rounded 1c → Karla → sans-serif`。

| 層級 |大小 | weight | 用途 |
|---|---|---|---|
| 頁面大標 | 32px | 600 | 「今天」「統計分析」等分頁標題 |
| 引導標題 | 26px | 600 | Onboarding 標題、時鐘盤中央時間 |
| 統計數字 | 24px | 700 | 「今日已完成工作」等統計卡數字 |
| 表單標題 | 20px | 600 | 事件表單標題 |
| 步進器值 | 17–18px | — | 入睡/起床/提前時間數值 |
| 內文/卡片標題 | 15px | 600 | 清單項目名稱、卡片標題 |
| 次要說明 | 13px | — | 說明文字、圖例 |
| 輔助 | 12px | — | 時間範圍、meta、streak |
| 微字 | 11px | 600 | Tab 標籤、刻度、按鈕內小提示 |

行高慣例：標題 1.15–1.25、內文 1.35–1.4、說明 1.6–1.7。

---

## 📐 Shape · 圓角、陰影、間距

- **圓角**：卡片 18px、清單列 16px、事件塊 14px、按鈕 14–16px、藥丸/開關 100px（全圓）、表單上緣 24px、色條 4–7px
- **陰影**：卡片 `0 2px 10px rgba(60,45,30,0.05)`；Toast `0 10px 30px rgba(0,0,0,0.25)`；表單 `0 -10px 30px rgba(0,0,0,0.15)`；開關圓鈕 `0 1px 3px rgba(0,0,0,0.2)`
- **邊框**：細 1px（`divider`）、強調 1.5px（預測卡、類別膠囊）、預測虛線 2px dashed（類別色）
- **間距**：畫面左右留白 20px；卡片 padding 16px；清單列間距 10px；區塊標題與內容 8–10px
- **時間軸幾何**：每小時 40px（24h＝960px）、左側刻度欄寬 44px、事件內縮 10px padding

---

## 🧩 Components · 元件規格

| 元件 | 規格摘要 |
|---|---|
| 分段控制 Segmented | 藥丸容器（`track` 底、radius 100、padding 3）；作用中：`ink` 實底＋`bg` 文字 700；非作用中：`inkSecondary` 文字 600 |
| 步進器 Stepper | 28px 圓鈕（`track` 底、`stepperInk` 符號 −／＋）；值最小寬 56–64px 置中；睡眠 ±0.25h 環繞 24h；提前時間 ±5min 夾限 5–30 |
| 開關 Toggle | 44×26 軌道（開 `success`／關 `trackAlt`）；22px 白色圓鈕（開 left 20／關 left 2） |
| 統計卡 Card | 白底、radius 18、padding 16、卡片陰影 |
| 類別膠囊 Chip | 藥囊選擇器：選中＝類別色實底白字；未選＝白底＋1.5px 類別色框＋類別色字 |
| 事件塊（時間軸） | 已確認＝類別色實底＋白字；預測＝`rgba(色,0.22)` 底＋2px 虛線框＋類別色字 |
| 現在線 NowLine | 2px `accent` 橫線＋10px 圓點＋左側粗體時間標籤 |
| 時鐘盤 ClockDial | 250px 外圈 conic-gradient（依事件起訖百分比分段填色）；170px 內圈 `bg`；中央時間 26px＋目前活動 12px；2px `ink` 指針以 24h 比例旋轉（0 點 = -90deg 起） |
| 週堆疊條 WeekBar | 每日 14px 高、radius 7；分段寬度=類別佔比%；今天標籤 700 `ink`，其餘 `inkMuted` |
| 例行列 RoutineRow | 26px 勾選圓（完成 `success`＋✓／未完 `trackAlt`）；名稱＋「連續 N 天 · 約 HH:MM」；完成者名稱轉 `inkSecondary` |
| 偵測通知 Toast | 頂部深色（`ink`）卡 radius 16；左側 `accent` 圓點 1.6s 脈動；兩動作：`accentLight` 粗體「查看並確認」／半透明「稍後再說」 |
| 事件表單 Sheet | 遮罩 `rgba(46,42,37,0.4)`；面板 `bg` 底上緣 radius 24、把手 36×4 `trackAlt`；刪除（次要 1 份寬）/確認（主要 2 份寬）按鈕 |
| Onboarding 色塊 | 150px 有機形（不對稱 border-radius）、三步漸層見 FR-ONB；進度點 7px、作用中拉長 22px 轉 `accent` |
| Tab Bar | 白底 90% 透明＋上緣 1px `divider`；每分頁＝7px 圓點（作用 `accent`／否則透明）＋11px 標籤（作用 `ink`／否則 `inkMuted`） |

### 動效

| 名稱 | 規格 |
|---|---|
| 脈動 pulse | opacity 1→0.55、scale 1→0.75，1.6s ease 無限循環（Toast 圓點） |
| Toast 進場 | translateY 10→0 + 淡入，0.35s ease |
| Sheet 進場 | translateY 100%→0，0.3s ease |

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
| 偵測通知 Toast | 與主畫面疊加 |

### 補充設計（2026-08-18 已定案）

原型未涵蓋的三項設計已於 [DESIGN-ADDENDUM.md](./DESIGN-ADDENDUM.md) 補齊，與本規格同等效力：**排程管理畫面（§A）、空狀態（§B）、語言切換列（§C）**。類別徽章英文化方案維持 Phase 1 拍板（見 I18N.md 設計延伸）。

---

## 🧱 Design Tokens · Token 檔

實作時以此 JSON 為單一事實來源（`app/src/theme/tokens.json`），與本文件同步維護：

```json
{
  "color": {
    "bg": "#FBF5EC", "ink": "#2E2A25", "inkSecondary": "#8A7F72", "inkMuted": "#B4A99C",
    "accent": "#E2795A", "accentLight": "#F2B79A",
    "success": "#7C9473", "successLight": "#B9C7B0",
    "track": "#F0E6D8", "trackAlt": "#E2D9C8", "divider": "#EFE6D8", "trackSoft": "#F5EFE3",
    "stepperInk": "#6E5C7E",
    "category": {
      "work": "#E2795A", "sleep": "#6E5C7E", "meal": "#D9A441",
      "exercise": "#7C9473", "leisure": "#C97B84", "commute": "#A79B8E", "other": "#B7A99A"
    }
  },
  "font": {
    "family": "'M PLUS Rounded 1c','Karla',sans-serif",
    "size": { "pageTitle": 32, "onboardTitle": 26, "stat": 24, "sheetTitle": 20, "body": 15, "secondary": 13, "caption": 12, "micro": 11 }
  },
  "radius": { "card": 18, "row": 16, "eventBlock": 14, "button": 14, "pill": 100, "sheetTop": 24 },
  "shadow": {
    "card": "0 2px 10px rgba(60,45,30,0.05)",
    "toast": "0 10px 30px rgba(0,0,0,0.25)",
    "sheet": "0 -10px 30px rgba(0,0,0,0.15)"
  },
  "timeline": { "pxPerHour": 40, "leftGutter": 44, "hourMarkStep": 2 },
  "clock": { "diameter": 250, "innerDiameter": 170 }
}
```
