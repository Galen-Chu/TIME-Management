# 🧩 Design Addendum · 補充設計規格

> 本文件補齊原型未涵蓋的三項設計：**排程管理畫面（§A）、空狀態（§B）、語言切換列（§C）**。2026-08-18 定案，與原型（`TimeCare.dc.html`）同等效力；一切視覺 token、元件沿用 [DESIGN-SPEC.md](./DESIGN-SPEC.md)，不另立新樣式。

---

## 🗓️ A. Schedule Management · 排程管理畫面

### A1 定位與入口

排程＝**未來會發生的固定安排**（會議、課程、習慣課表），與「已記錄的時間」互補。排程不改變過去紀錄，而是在時間到時自動生成「待確認」事件，銜接既有的 AI 預測確認流程（FR-EVT／FR-DTC）。

- **入口**：「今天」分頁標題區、日／週切換的左側，新增日曆圖示按鈕（28×28 圓鈕，`track` 底、`inkSecondary` 圖示；有未確認排程事件時圖示轉 `accent`）
- 點擊後 push 進入排程管理畫面（上滑進場，沿用系統導覽轉場）

### A2 排程清單畫面

- 標題「排程」（32px 頁面大標樣式）；右上方「＋ 新增」膠囊按鈕（`ink` 實底、`bg` 文字）
- 清單依「下次發生時間」升序排列；每列沿用清單卡樣式（白底、radius 16、padding 12/14、卡片陰影）：
  - 左側 40px 圓角方塊圖示：**排程類別色**（新增類別欄位，見 A5）淡底 `rgba(色,0.18)`＋類別色徽章字
  - 主行：排程標題（15px 600）
  - 副行：重複描述＋時間（12px `inkMuted`），如「每週一三五 · 07:00」「單次 · 7月16日 10:30」
  - 右側：提醒開關（既有 Toggle 元件）
- 點擊列（開關除外）→ 開啟排程表單（A3）
- 「今天」適用的排程列，副行前加 `accent` 小圓點標示

### A3 排程表單（Bottom Sheet）

沿用事件表單的版型（遮罩、上緣圓角 24、拖曳把手、刪除／儲存 1:2 雙按鈕）：

| 欄位 | 控件 | 規格 |
|---|---|---|
| 標題 | 文字輸入框 | 沿用事件表單輸入框樣式 |
| 類別 | 類別膠囊選擇器 | 7 類別，沿用既有樣式 |
| 重複 | 膠囊四選一 | 每天／每週／每兩週一次／單次 |
| 星期 | 膠囊多選（一～日） | 僅「每週／每兩週一次」時顯示 |
| 日期 | 日期選擇 | 僅「單次」時顯示 |
| 時間 | 時：分步進器 | 沿用 Stepper 樣式；15 分鐘步階 |
| 時長 | 時長步進器 | 0.5–4 小時，0.5 步階，預設 1 小時 |
| 提醒 | 開關 | 預設開啟；沿用 leadTime 與通知風格設定 |

### A4 與主流程整合

- **到點生成待確認事件**：排程時間到（依 `leadTime` 提前提醒、時間到生成），自動建立 `predicted: true`、`source: 'predicted'` 的事件（label＝排程標題、類別＝排程類別、時長＝排程時長），進入既有「AI 預測 · 待確認」清單，使用者一鍵確認
- **日誌卡新增「今日排程」區塊**：位置在「每日例行工事」之上；時間已到的排程顯示為待確認卡（虛線樣式、含「確認」標籤），未到的以淡色卡呈現時間
- 提醒開啟的排程依 `notifyStyle` 決定溫和卡片或主動推播；免打擾時段照常抑制

### A5 資料模型補充（取代原型的顯示用字串欄位）

```ts
interface ScheduleItem {
  id: string;
  title: string;
  category: CategoryKey;                 // 新增：圖示著色與預測分類
  recurrence: 'daily' | 'weekly' | 'biweekly' | 'once';
  weekdays: number[];                    // 1=一 … 7=日（weekly/biweekly 用）
  date?: string;                         // YYYY-MM-DD（once 用）
  time: number;                          // 0–24，0.25 步階
  durationH: number;                     // 0.5–4，預設 1
  reminderOn: boolean;
}
```

原型的 `timeLabel`／`recurrenceLabel` 改為由上述結構化欄位＋i18n 組合出顯示字串（如 `schedule.recurrence.weekly`＋星期 keys）。

### A6 狀態

| 狀態 | 呈現 |
|---|---|
| 空清單 | 空狀態元件（§B：`empty.schedule`） |
| 單一／多筆 | 標準清單 |
| 編輯中 | 表單 Sheet 開啟，遮罩鎖背景 |
| 今日有排程 | 對應列副行前 `accent` 點；日誌卡顯示「今日排程」區塊 |

### A7 i18n（`schedule` namespace）

| Key | zh-TW | en-US |
|---|---|---|
| `schedule.title` | 排程 | Schedules |
| `schedule.today` | 今日排程 | Today's schedule |
| `schedule.add` | 新增排程 | New schedule |
| `schedule.edit` | 編輯排程 | Edit schedule |
| `schedule.next` | 下次 {{when}} | Next {{when}} |
| `schedule.recurrence.daily` | 每天 | Daily |
| `schedule.recurrence.weekly` | 每週 | Weekly |
| `schedule.recurrence.biweekly` | 每兩週一次 | Every 2 weeks |
| `schedule.recurrence.once` | 單次 | Once |
| `schedule.weekday.1`–`7` | 一／二／三／四／五／六／日 | Mon／Tue／Wed／Thu／Fri／Sat／Sun |
| `schedule.time` | 時間 | Time |
| `schedule.duration` | 時長 | Duration |
| `schedule.category` | 類別 | Category |
| `schedule.reminder` | 提醒 | Reminder |
| `schedule.repeatRule` | {{recurrence}} · {{weekdays}} | {{recurrence}} · {{weekdays}} |

---

## 🫧 B. Empty States · 空狀態

### B1 元件規格（EmptyState）

- **圖形**：80px 有機形色塊（沿用 Onboarding blob 語彙），`trackSoft` 底＋情境類別色 15% 淡漸層；不動畫（空狀態應安靜）
- **標題**：15px 600 `ink`
- **說明**：13px `inkSecondary`，最多兩行
- **CTA（可選）**：膠囊按鈕（`track` 底 `ink` 文字，如「＋ 新增」）
- 垂直置中於其卡片／區塊內，上下留白 24px

### B2 情境與雙語文案

| 情境 | zh-TW | en-US | CTA |
|---|---|---|---|
| 時間軸／日誌卡首日無紀錄 | 還沒有任何紀錄 / 今晚回顧時，補上今天的第一段時間吧 | Nothing logged yet / Add your first moment when you review tonight | 無 |
| 例行工事清單空 | 還沒有例行工事 / 建立一個小到不可能失敗的習慣 | No routines yet / Start one small enough not to fail | ＋ 新增 |
| 統計無資料（前幾天） | 數字會在記錄幾天後出現 / 每天一點紀錄，很快就會看到你的節奏 | Numbers appear after a few days / A little each day — your rhythm will show soon | 無 |
| 週檢視無資料 | 這週還是空的 / 從今天開始吧 | This week is still blank / Start today | 無 |
| 排程清單空（§A） | 沒有固定排程 / 新增會議、課程或習慣課表 | No schedules yet / Add meetings, classes, or rituals | ＋ 新增排程 |

### B3 原則

1. 空狀態不是錯誤狀態：語氣溫柔、不指責、不催促，與 App「溫柔不打擾」原則一致
2. 原型採「有資料才顯示」的區塊（「已完成」「AI 預測 · 待確認」）**維持隱藏**，不加空狀態；空狀態只用於常駐區塊
3. 文案雙語同 tone，en-US 不逐字直翻

---

## 🔤 C. Language Row · 語言切換列

### C1 位置與樣式

設定分頁（AI 預測與提醒）**最底新增一張設定卡**，樣式完全沿用既有設定卡（白底、radius 18、padding 16、卡片陰影）：

- 標題「語言 / Language」——**雙語並列顯示**（切換語言後仍並列，確保任何語言下都找得到）
- 說明文字「切換介面語言 / Switch the interface language」（同樣並列）
- 下方分段控制二選一（沿用 Segmented 樣式）：`繁體中文`｜`English`（兩語下選項文字不變）

### C2 行為

- 選取即時生效（`i18next.changeLanguage`），全部字串、日期、時長格式同步切換，**無需重啟**
- 寫入 `Settings.language` 持久化；使用者一旦手動選擇即固定，不再跟隨系統
- 首次安裝（未手動選過）跟隨系統語言，系統非 zh/en 時 fallback `zh-TW`（見 I18N.md 語言解析順序）

### C3 i18n（`settings` namespace 增補）

| Key | zh-TW | en-US |
|---|---|---|
| `settings.language` | 語言 / Language | 語言 / Language |
| `settings.languageDesc` | 切換介面語言 / Switch the interface language | 切換介面語言 / Switch the interface language |
| `settings.langZhTW` | 繁體中文 | 繁體中文 |
| `settings.langEn` | English | English |

> 語言相關 key 內容兩語一致（並列顯示），不隨 locale 變動。

### C4 驗收

- [ ] 切換即時生效且重啟記憶選擇
- [ ] 切換後日期／時長／streak 格式隨 locale 改變
- [ ] 兩語下切換列標題皆並列可讀、找不到語言的情境不存在
