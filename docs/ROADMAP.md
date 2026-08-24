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

- [ ] 例行工事：勾選、streak 計算與跨日重算
- [ ] 統計四卡片：涵蓋率、類別分佈（本週/本月口徑）、堆疊圖、洞察範本組字
- [ ] 統計口徑單元測試（含空資料、單日資料邊界）
- [ ] 排程管理：結構化資料模型、清單畫面、排程表單、日誌卡「今日排程」區塊（DESIGN-ADDENDUM §A）

## ✅ Phase 4 · 智慧功能

- [ ] 偵測服務：geofence＋停留判定（裝置端）、Toast 流程、查看並確認
- [ ] 規則式預測：timeHint＋歷史眾數＋睡眠視窗；敏感度門檻（0.8/0.6/0.4）
- [ ] 彈性作息（區間輸出）與非規律模式（權重調整）接入預測
- [ ] 通知：leadTime 提醒、溫和卡片 vs 主動推播、免打擾 22:00–07:00 抑制
- [ ] 排程到點生成待確認事件（DESIGN-ADDENDUM §A4，與預測服務銜接）
- [ ] 情境腳本測試（模擬感測器）

## ✅ Phase 5 · 雙語全量與打磨

- [ ] en-US locale 全量翻譯（以 I18N 樣張為基底擴充）
- [ ] 語言切換設定列＋即時切換＋持久化
- [ ] 徽章英文化/icon 方案落地
- [ ] 無障礙：動態字型、對比度、切換控制
- [ ] 效能：檢視切換 <300ms、統計 <500ms 驗證
- [ ] Detox E2E：核心流程雙語各跑一輪
- [ ] 雙語擷圖比對、上線準備（商店文案/截圖雙語）

---

## 📌 Checkpoint · 檢查點制度

1. 每階段完成 → 展示（畫面或測試報告）→ 使用者驗收
2. 驗收通過 → commit ＋ push（此為固定 checkpoint，未經核准不 push）
3. 文件與實作不一致時：**以原型為互動依據、以本文件集為規格依據**，發現偏差先修文件再修程式
