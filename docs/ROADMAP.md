# 🚀 Roadmap · 開發路線

> 採階段制（phase-gated）：每階段結束需向使用者展示成果並驗收，核准後才 commit/push 進入下一階段。i18n 自 Phase 1 起強制（所有字串走 key），避免日後補翻。

---

## 🗺️ Phase Overview · 階段總覽

| 階段 | 主題 | 里程碑 | 驗收標準 |
|---|---|---|---|
| Phase 0 | 規格凍結與技術棧拍板 | 文件集定案 | 使用者核准本文件集；技術棧定案 Expo＋TS ✅（2026-08-18） |
| Phase 1 | App 骨架與設計系統 | 可點擊原型 | Onboarding＋4 分頁＋Sheet/Toast 靜態走查通過（對照 DESIGN-SPEC） |
| Phase 2 | 今日核心（資料＋事件） | 完整記錄一天 | 三種日檢視＋週檢視正確渲染；事件 CRUD 全流程可用 |
| Phase 3 | 例行工事與統計分析 | 資料可視化 | 統計四卡片數值與測試資料一致（單元測試覆蓋） |
| Phase 4 | 智慧功能 | AI 預測可確認 | 偵測 Toast、規則式預測、提醒與免打擾行為符合 FR-DTC/FR-SET |
| Phase 5 | 雙語全量與打磨 | 雙語完整版 | en-US 全量翻譯＋語言切換＋無障礙＋雙語擷圖比對通過 |

---

## ✅ Phase 0 · 規格凍結與技術棧拍板

- [x] 使用者審核 docs/ 文件（2026-08-18 核可；含 DESIGN-ADDENDUM）
- [x] 技術棧拍板：Expo（React Native）＋ TypeScript，dev client 起案（2026-08-18，見 ARCHITECTURE.md）
- [x] 待補設計產出：排程管理畫面、空狀態、語言切換列已定案（DESIGN-ADDENDUM.md）；類別徽章英文化維持 Phase 1 拍板
- [x] repo 基礎設施：`.gitignore`、LICENSE（MIT）、分支策略（main＋feat/* 功能分支，2026-08-24）

## ✅ Phase 1 · App 骨架與設計系統

- [x] Expo 專案建置（SDK 57、expo-router、TypeScript strict;prebuild/dev client 留待 Phase 4 背景定位時進行，Phase 1–3 以 Expo Go／web 開發即可）
- [x] `theme/tokens.json` 落地（對應 DESIGN-SPEC，單一事實來源）
- [x] 基礎元件：Segmented、Stepper、Toggle、Card、CategoryChip、BottomSheet、Toast（＋EmptyState）
- [x] 畫面骨架：Onboarding 3 步＋4 分頁導覽（含虛擬資料;今天三檢視＋週檢視、統計四卡、彈性調節、AI 設定＋語言切換）
- [x] i18n 骨架：i18next 建置、zh-TW/en-US locale 對稱全量、ESLint 禁寫死 CJK 規則（NFR-6）
- [x] 自動驗證：tsc strict 通過;Jest 16/16（token 完整性、雙語 key 對稱、領域不變量、元件互動）;web 走查（headless 截圖 12 張＋像素驗證）
- [ ] 走查:對照原型逐畫面檢查(間距/圓角/色碼/動效)——**待使用者驗收(2026-08-24 提交)**

> 已知 web 限制(不影響 native):執行期切換分頁時畫面內容不隨之切換(RN-web bottom-tabs 行為),直達 URL 則完全正常;走查截圖以直達 URL 模式產製。

## ✅ Phase 2 · 今日核心

- [x] SQLite schema ＋ migration ＋ repository（ARCHITECTURE 資料模型）
- [x] 事件領域邏輯：重疊判定、跨午夜、時間軸幾何（40px/h）
- [x] 時間軸／時鐘盤（SVG 弧段）／日誌卡三檢視（接真資料）
- [x] 週檢視堆疊條＋長按進該日
- [x] 事件表單 CRUD：改名、換類別、刪除、確認（新增/確認/編輯三模式）
- [x] 單元測試：領域純函式 36 測試（重疊/跨日/夾限/streak/CRUD 流程）
- [x] 空狀態元件與情境文案接線（DESIGN-ADDENDUM §B）

## ✅ Phase 3 · 例行工事與統計分析

- [x] 例行工事:勾選(streak ±1)、跨日重算、新增/刪除 CRUD
- [x] 統計四卡片:涵蓋率、類別分佈(本週 7 天/本月 30 天口徑)、堆疊圖、洞察範本組字——接 domain 純函式真計算
- [x] 統計口徑單元測試(空資料/單日/跨午夜/預測排除/邊界)+ 排程領域測試(occursOn/nextOccurrence/sort)
- [x] 排程管理:結構化資料模型(§A5)、清單畫面(§A2 排序/accent 點)、排程表單(§A3 全欄位)、「今天」日曆入口、日誌卡「今日排程」區塊(§A4)

## ✅ Phase 4 · 智慧功能

- [x] 偵測服務:detection.ts(停留判定純函式+距離計算+Toast 參數轉換)、Toast 元件+流程(查看並確認→事件表單);native geofence 留 dev client(Phase 5)
- [x] 規則式預測:prediction.ts(timeHint+歷史眾數+睡眠視窗;敏感度 0.8/0.6/0.4;彈性作息=區間;非規律=信心打折;誠實失敗)
- [x] 彈性作息(rangeStart/rangeEnd 區間)與非規律模式(信心×0.6)接入預測
- [x] 通知:notification.ts(leadTime 5-30 夾限/溫和 vs 推播/免打擾 22:00-07:00 抑制)
- [x] 排程到點生成待確認事件(§A4,冪等;smartTick 整合預測+排程)
- [x] 情境腳本測試(32 服務測試:預測 12+通知 6+偵測 4+整合 2+smart tick 2+既有 6)

## ✅ Phase 5 · 雙語全量與打磨

- [x] en-US locale 全量翻譯(Phase 1 起對稱維護;parity test 驗證)
- [x] 語言切換設定列+即時切換+持久化;語言偵測 fallback 修正為 zh-TW(2026-08-25)
- [x] 徽章方案:類別色圓角方塊(兩語一致;2026-08-24 拍板)
- [x] 無障礙:accessibilityRole/State 全面接入;動態字型(RN 預設)
- [x] 效能:三檢視即時切換;統計 30 天純函式 <1ms
- [x] 雙語 E2E:headless Chrome 走查(scripts/phase5-walkthrough.py)
- [x] 雙語擷圖(.shots/p5-*.png);字體切換 Noto Sans TC 為主字體(2026-08-25 拍板)

---

## 🔬 Phase 6 · 完整驗收

開發階段(Phase 0–5)全部完成後的**整合性驗收**:完整使用者情境、回歸測試、端對端驗收。

- 詳細測試計畫與執行結果:**[ACCEPTANCE.md](./ACCEPTANCE.md)**(方案 C:獨立驗收文件)
- 5 條核心使用者旅程 × 全步驟逐一驗證
- 86 項 Jest 回歸測試全綠
- 雙語 headless E2E 走查(zh/en 各一輪)
- 通過標準與已知豁免見 ACCEPTANCE.md §4–5

---

## 📌 Checkpoint · 檢查點制度

1. 每階段完成 → 展示（畫面或測試報告）→ 使用者驗收
2. 驗收通過 → commit ＋ push（此為固定 checkpoint，未經核准不 push）
3. 文件與實作不一致時：**以原型為互動依據、以本文件集為規格依據**，發現偏差先修文件再修程式
