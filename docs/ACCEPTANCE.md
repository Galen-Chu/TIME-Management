# ✅ Acceptance Test Plan · 驗收測試計畫

> 依 ROADMAP Phase 6 執行。涵蓋完整使用者情境、回歸測試、端對端驗收。
> 執行日期:2026-08-25 | 執行者:Claude(headless 自動化)+ Galen-Chu(人工複核)

---

## 📊 Summary · 彙總

| 類別 | 項目數 | 通過 | 失敗 | 狀態 |
|---|---|---|---|---|
| 使用者情境 | 5 | — | — | ⬜ 待執行 |
| 回歸測試(Jest) | 86 | — | — | ⬜ 待執行 |
| E2E 雙語走查 | — | — | — | ⬜ 待執行 |
| **總計** | — | — | — | ⬜ |

---

## 🧭 1. 完整使用者情境 | User Scenarios

### S1 首次使用(Onboarding)

| # | 步驟 | 預期 | 通過 |
|---|---|---|---|
| S1-1 | 開啟 App | 顯示 Onboarding 步驟 1(漸層色塊+進度點) | ⬜ |
| S1-2 | 點「繼續」→ 步驟 2 → 步驟 3 | 色塊漸層切換、進度點拉長轉 accent | ⬜ |
| S1-3 | 步驟 3 點「開始使用」 | 進入主畫面「今天」 | ⬜ |
| S1-4 | 關閉重開 App | 不再出現 Onboarding(直接進主畫面) | ⬜ |
| S1-5 | 跳過(另次安裝) | 點「跳過」直接進主畫面 | ⬜ |

### S2 記錄一天(事件 CRUD)

| # | 步驟 | 預期 | 通過 |
|---|---|---|---|
| S2-1 | 時間軸點空白處 | 開啟「新增」事件表單(時間=點擊位置) | ⬜ |
| S2-2 | 填名稱+選類別+儲存 | 事件塊出現在時間軸(實心+白字) | ⬜ |
| S2-3 | 點事件塊 → 編輯 | 開啟「編輯」表單(預填原名稱/類別) | ⬜ |
| S2-4 | 改名+換類別+儲存 | 事件更新(色/名/類別同步) | ⬜ |
| S2-5 | 重疊時段新增 | 被拒(不寫入;重疊防護) | ⬜ |
| S2-6 | 刪除事件 | 事件消失 | ⬜ |
| S2-7 | 切時鐘盤/日誌卡 | 三檢視一致渲染(弧段/清單/統計) | ⬜ |

### S3 例行工事(Streak)

| # | 步驟 | 預期 | 通過 |
|---|---|---|---|
| S3-1 | 日誌卡:勾選例行工事 | ✓ 綠底、streak +1、名稱轉灰 | ⬜ |
| S3-2 | 取消勾選 | ✓ 消失、streak −1 | ⬜ |
| S3-3 | 統計卡「例行工事完成」| 數字即時更新(n/m) | ⬜ |

### S4 排程管理(§A)

| # | 步驟 | 預期 | 通過 |
|---|---|---|---|
| S4-1 | 今天 tab 點日曆按鈕 | 進入排程管理畫面 | ⬜ |
| S4-2 | 新增排程(每天 07:00 1h) | 清單出現(類別色塊+重複描述+時間) | ⬜ |
| S4-3 | 提醒開關切換 | 開關狀態切換 | ⬜ |
| S4-4 | 編輯排程(改時間/類別) | 更新後清單反映 | ⬜ |
| S4-5 | 刪除排程 | 清單移除 | ⬜ |
| S4-6 | 日誌卡「今日排程」| 今天適用的排程顯示在例行工事之上 | ⬜ |

### S5 語言切換(FR-I18N)

| # | 步驟 | 預期 | 通過 |
|---|---|---|---|
| S5-1 | 首次開啟(英文瀏覽器) | 顯示 zh-TW(預設;不跟隨系統 en) | ⬜ |
| S5-2 | 設定 → 語言列 → English | 即時切換:標題/分頁/卡片/日期全轉英文 | ⬜ |
| S5-3 | 重開 App | 語言持久(en-US) | ⬜ |
| S5-4 | 切回繁體中文 | 即時切換回 zh | ⬜ |
| S5-5 | 語言列標題 | 「語言 / Language」雙語並列(任何語言下) | ⬜ |

---

## 🧪 2. 回歸測試 | Regression Tests(Jest 自動化)

| 測試套件 | 涵蓋 | 項目數 | 通過 |
|---|---|---|---|
| `domain/__tests__/events` | 重疊/跨午夜/夾限/幾何/彙總 | 12 | ⬜ |
| `domain/__tests__/invariants` | leadTime 夾限/sleep 環繞/格式化 | 8 | ⬜ |
| `domain/__tests__/stats` | 涵蓋率/分佈/堆疊/趨勢/空資料 | 9 | ⬜ |
| `domain/__tests__/schedule` | occursOn/next/sort/clamp | 4 | ⬜ |
| `i18n/__tests__/parity` | zh-TW/en-US key 100% 對稱 | 2 | ⬜ |
| `services/__tests__/prediction` | 敏感度/睡眠/歷史/彈性/非規律 | 12 | ⬜ |
| `services/__tests__/notification` | leadTime/免打擾/排程到點/冪等 | 6 | ⬜ |
| `services/__tests__/detection` | 距離/停留判定/Toast 參數 | 4 | ⬜ |
| `services/__tests__/smart-tick` | 整合入口/冪等 | 2 | ⬜ |
| `state/__tests__/todayStore` | CRUD/重疊/確認/streak/跨日 | 11 | ⬜ |
| `state/__tests__/scheduleStore` | 排程 save/delete/routine CRUD | 2 | ⬜ |
| `components/ui/__tests__/toggle` | 開關互動 | 1 | ⬜ |
| `theme/__tests__/tokens` | DESIGN-SPEC 一致性 | 5 | ⬜ |
| **總計** | | **86** | — |

執行指令:`npm test`

---

## 🌐 3. 端對端驗收 | E2E Bilingual Walkthrough

以 headless Chrome(402×874 原型框)執行 `scripts/phase5-walkthrough.py`。

### 通過標準

| # | 標準 | 通過 |
|---|---|---|
| E2E-1 | 預設 zh-TW(英文瀏覽器) | ⬜ |
| E2E-2 | Onboarding 三步+完成進主畫面 | ⬜ |
| E2E-3 | 今天分頁:時間軸/時鐘盤/日誌卡/週檢視切換 | ⬜ |
| E2E-4 | 事件 CRUD 全流程(新增→編輯→刪除) | ⬜ |
| E2E-5 | 統計頁:四卡片+本週/本月切換 | ⬜ |
| E2E-6 | 彈性調節:步進器+開關 | ⬜ |
| E2E-7 | 設定頁:敏感度/提前時間/通知/免打擾/語言 | ⬜ |
| E2E-8 | 語言切換 zh→en→zh(即時+持久) | ⬜ |
| E2E-9 | 零 SEVERE console error(不含 RN-web 已知 DOM warning) | ⬜ |
| E2E-10 | 雙語截圖(.shots/)無排版溢出/爆版 | ⬜ |

---

## 🏁 4. 通過標準 | Pass Criteria

- [ ] 5 使用者情境:全部步驟通過
- [ ] 86 項回歸測試:全部綠燈
- [ ] 10 項 E2E 標準:全部通過
- [ ] 雙語截圖:en-US 長字串不溢出(en 文字平均 1.3–1.6 倍)

## 📝 5. 已知限制與豁免

| 項目 | 說明 | 豁免 |
|---|---|---|
| Web tab 切換 | RN-web bottom-tabs 執行期切換內容不換;直達 URL 正常 | ✅ 豁免(native 不受影響;walkthrough 用直達 URL) |
| Web 資料層 | InMemory 不跨頁面持久 | ✅ 豁免(native SQLite;Jest 覆蓋邏輯) |
| 偵測 Toast | Phase 4 以 10 秒模擬觸發;native geofence 需 dev client | ✅ 豁免(元件+流程已驗證) |
| RN-web DOM warning | `shadow*` style props 警告 | ✅ 豁免(dev mode only) |

---

*本文件為驗收執行的工作文件——各項通過後勾選;全數通過即為 App 驗收完成。*
