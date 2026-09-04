# ⏳ TimeCare · 24 小時時間管理

> 溫柔紀錄 24 小時的每一刻 — AI 預測作息、一鍵確認、支援彈性與非規律生活，並提供英中雙語（zh-TW / en-US）的時間管理 App。設計原型來自 Claude Design（`TimeCare.dc.html`）。
---

## 🧭 Overview · 專案概況

TimeCare 不是另一個行事曆，而是一支「**全時段覆蓋**」的時間記錄 App：24 小時的每一段時間（含睡眠、通勤、用餐）都會被溫柔記錄。核心理念是 **AI 溫柔猜測，你來確認** — 系統自動預測與偵測可能發生的事，使用者只需輕輕點一下確認或修改，不需要時時刻刻手動輸入。

核心使用循環：**偵測／預測 → 一鍵確認 → 統計洞察 → 彈性調節**。

設計原型（互動規格的最終依據）：Claude Design 專案「24小時時間管理APP」→ [`TimeCare.dc.html`](./docs/DESIGN-SPEC.md)，完整規格見 [docs/DESIGN-SPEC.md](./docs/DESIGN-SPEC.md)。

---

## ✅ Status · 專案狀態

| 階段 | 狀態 |
|---|---|
| Phase 0 規格凍結與技術棧 | ✅ 完成 |
| Phase 1 App 骨架與設計系統 | ✅ 完成 |
| Phase 2 今日核心（資料+事件） | ✅ 完成 |
| Phase 3 例行工事+統計+排程管理 | ✅ 完成 |
| Phase 4 智慧功能（預測/偵測/通知） | ✅ 完成 |
| Phase 5 雙語全量與打磨 | ✅ 完成 |
| Phase 6 完整驗收 | ✅ 完成（132/132 全綠）→ [ACCEPTANCE.md](./docs/ACCEPTANCE.md) |

> **開發全程完成（2026-08-31 收尾歸檔）**：Phase 0–6 全數驗收合併；覆核 `tsc`／Jest 86 測試／`lint` 全綠。
> **優化系列完成（同日，五批）**：P0 正確性修復、平台服務接線（定位/通知）、P1 錯誤處理、P2 效能（訂閱粒度/精準更新）、P3 測試補強；測試 86 → **132**，CI（GitHub Actions）全綠。

**本機執行**(Expo SDK 57 / TypeScript strict):

```bash
npm install
npx expo start --web   # 瀏覽器即時預覽
npx expo start         # iOS/Android 模擬器(Expo Go)
```

品質門檻:`npm run lint`(含 NFR-6 禁寫死字串規則)、`npm test`(**132 測試**)、`npm run typecheck`;一次跑全:`npm run verify`(= lint+typecheck+test,同 CI)。

驗收測試:**[docs/ACCEPTANCE.md](./docs/ACCEPTANCE.md)**(5 情境+86 回歸+雙語 E2E)。

---

## ✨ Features · 功能總覽

| 功能 | 說明 | 狀態 |
|---|---|---|
| 🕐 24 小時時間軸 | 時間軸 / 時鐘盤 / 日誌卡三種日檢視 + 週堆疊圖 | ✅ 已實作 |
| 🤖 AI 預測與一鍵確認 | 預測事件以虛線呈現，點一下即確認轉為正式紀錄 | ✅ 已實作 |
| 📡 情境偵測 | 偵測地點停留（如「辦公室停留 45 分鐘」）主動詢問確認 | ✅ 已實作 |
| ✅ 每日例行工事 | 習慣清單搭配連續天數（streak）與時間提示 | ✅ 已實作 |
| 📊 統計分析 | 記錄涵蓋率、各類別時間分佈、每日堆疊圖、AI 洞察文字 | ✅ 已實作 |
| 🧘 彈性調節 | 睡眠視窗、彈性作息（區間取代時間點）、非規律模式 | ✅ 已實作 |
| 🔔 AI 預測與提醒 | 預測敏感度三段、提醒提前時間、溫和/主動通知風格、免打擾時段 | ✅ 已實作 |
| 🗓️ 排程管理 | 固定排程（會議、課程、習慣課表）、提醒開關、到點自動生成待確認事件 | ✅ 已實作 |
| 🌐 英中雙語 | zh-TW（預設）與 en-US 全介面雙語，含語言切換列 | ✅ 已實作 |

---

## 🏗️ Architecture · 架構總覽

採分層架構，關注點分離：**呈現（長什麼樣）**、**狀態（現在如何）**、**領域（規則是什麼）**、**資料（存在哪裡）**、**智慧服務（AI 做什麼）** 各自獨立，AI 預測與情境偵測以可抽換的服務模組呈現，隱私優先（處理盡量在裝置端完成）。

```
① 呈現層 Presentation   → 4 分頁 + Onboarding + 事件表單 / 偵測通知
② 應用層 Application    → 畫面狀態、導覽、使用者操作流程
③ 領域層 Domain         → 時段事件、例行工事、統計規則、提醒策略
④ 資料層 Data           → 本機資料庫（離線優先）、匯出
⑤ 智慧服務 AI Services  → 預測模組、情境偵測模組、通知模組
```

技術棧已定案（2026-08-18）：**Expo（React Native）＋ TypeScript**，dev client 起案。詳細內容（技術棧、資料模型、AI 模組分版規劃）見 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

---

## 📁 Project Structure · 專案結構

```
TIME-Management/
├── README.md / CLAUDE.md
├── docs/                          # 開發文件（本文件集）
│   ├── REQUIREMENTS.md            # 功能需求規格（FR/NFR 編號）
│   ├── ARCHITECTURE.md            # 技術架構與資料模型（技術棧定案）
│   ├── DESIGN-SPEC.md             # 設計規格（色彩/字體/元件/動效）
│   ├── DESIGN-ADDENDUM.md         # 補充設計：排程管理/空狀態/語言切換
│   ├── I18N.md                    # 英中雙語規劃
│   ├── ROADMAP.md                 # Phase 0–6 階段式開發路線
│   └── ACCEPTANCE.md              # Phase 6 驗收測試計畫與結果（132/132）
├── scripts/                       # web／E2E 走查腳本（Python＋Selenium）
├── assets/                        # 圖示與字體
└── src/                           # App 原始碼（Expo 專案根即 repo 根）
    ├── app/                       # expo-router 路由（含 (tabs) 四分頁）
    ├── components/                # ui／today／schedule 元件（EventSheet、Toast…）
    ├── state/                     # Zustand 畫面狀態
    ├── domain/                    # 純函式領域規則（重疊／跨日／統計）
    ├── data/                      # SQLite（native）／ InMemory（web）儲存庫
    ├── services/                  # detection / prediction / notification / smartTick
    ├── i18n/                      # locales/zh-TW.json、en-US.json
    ├── hooks/ · constants/ · theme/ · mock/
    └── __tests__（各層內）
```

---

## 🎨 Design System · 設計系統

暖調奶油底（`#FBF5EC`）搭配深墨棕文字（`#2E2A25`），強調色為陶土橘（`#E2795A`）；七大時間類別各有專屬色（工作／睡眠／用餐／運動／休閒／通勤／其他）。字體採 M PLUS Rounded 1c（中日韓）＋ Karla（拉丁），圓角卡片與藥丸分段控制構成溫柔調性。

| 語意 | 色碼 |
|---|---|
| 背景奶油 | `#FBF5EC` |
| 主要文字 | `#2E2A25` |
| 強調（現在線／作用中） | `#E2795A` |
| 成功／開啟 | `#7C9473` |
| 軌道底 | `#F0E6D8` |

完整 token（色彩、字級、圓角、陰影、動效）見 [docs/DESIGN-SPEC.md](./docs/DESIGN-SPEC.md)。

---

## 🌐 Bilingual · 英中雙語

App 以 **zh-TW 為預設語言**（原型即繁中），**en-US 為完整第二語言**：所有介面字串自第一天起一律走 i18n key（不得寫死文字），日期／時長／連續天數等格式交由 Intl 依 locale 呈現；設定分頁並含「語言切換」列（設計已定案，見補遺 §C）。雙語字樣對照表與品質檢查清單見 [docs/I18N.md](./docs/I18N.md)。

---

## 🚀 Roadmap · 開發路線

| 階段 | 內容 | 里程碑 |
|---|---|---|
| Phase 0 | 規格凍結（本文件集）＋技術棧拍板 | 文件定案 |
| Phase 1 | App 骨架＋設計 token＋Onboarding／4 分頁／表單靜態 UI＋i18n 骨架 | 可點擊原型 |
| Phase 2 | 資料層＋事件 CRUD＋三種日檢視＋週檢視 | 本機完整記錄一天 |
| Phase 3 | 例行工事＋統計分析四卡片 | 資料可視化 |
| Phase 4 | 情境偵測＋規則式預測＋提醒通知 | AI 預測可確認 |
| Phase 5 | en-US 全量翻譯＋語言切換＋無障礙＋打磨 | 雙語完整版 |
| Phase 6 | 完整驗收（5 情境＋86 回歸＋雙語 E2E） | 132/132 全綠 ✅ |

各階段細項與驗收標準見 [docs/ROADMAP.md](./docs/ROADMAP.md)。

---

## 📐 Design Principles · 設計原則

1. **溫柔不打擾**：通知預設「溫和建議卡片」而非轟炸推播，免打擾時段（22:00–07:00）不主動出聲
2. **預測必經確認**：AI 的一切猜測以虛線／待確認呈現，使用者一鍵確認後才成為正式紀錄；無把握就不猜（誠實失敗）
3. **全時段覆蓋**：紀錄的是完整 24 小時，不是行事曆上的少數事件；睡眠與通勤也是生活
4. **彈性先於紀律**：不強制準時，用區間取代時間點；非規律模式服務自由工作者
5. **隱私優先**：位置與行為偵測盡量在裝置端處理，原始資料不上傳
6. **i18n 從第一天開始**：任何字串不得寫死在畫面裡，雙語是需求不是事後補丁

---

## 📚 Documents · 文件索引

| 文件 | 內容 |
|---|---|
| [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) | 逐畫面功能需求（FR 編號）與非功能需求 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 技術棧建議、分層架構、資料模型、AI 模組規劃 |
| [docs/DESIGN-SPEC.md](./docs/DESIGN-SPEC.md) | 設計原型來源與完整設計 token、元件規格 |
| [docs/DESIGN-ADDENDUM.md](./docs/DESIGN-ADDENDUM.md) | 補充設計：排程管理畫面、空狀態、語言切換列 |
| [docs/I18N.md](./docs/I18N.md) | 英中雙語架構、字串對照樣張、品質檢查清單 |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Phase 0–6 階段計畫與驗收檢查點 |
| [docs/ACCEPTANCE.md](./docs/ACCEPTANCE.md) | Phase 6 完整驗收測試計畫與執行結果 |

---

## 👤 Author

**Galen Chu**

- GitHub: [@Galen-Chu](https://github.com/Galen-Chu)
- LinkedIn: [Galen Chu](https://www.linkedin.com/in/galen-chu-203590b5/)
