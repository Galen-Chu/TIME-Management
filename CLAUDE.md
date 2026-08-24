# CLAUDE.md

TimeCare · 24 小時時間管理 App(Galen-Chu/TIME-Management)。目前 repo 為**開發文件集**(docs only),App 尚未建置;設計原型在 Claude Design(私有,見下方)。

## 專案現況(2026-08-24)

- 7 份開發文件定案並推送(root commit `48ec65b`):README + docs/{REQUIREMENTS, ARCHITECTURE, DESIGN-SPEC, DESIGN-ADDENDUM, I18N, ROADMAP}.md
- **Phase 0 完成**(含 repo 基礎設施:.gitignore、MIT LICENSE、main+feat/* 分支策略)
- **Phase 1 完成並驗收合併(2026-08-24,merge bf570e5;含回饋修正:Noto Sans TC 字型回落、正圓時鐘盤)**:Expo SDK 57 專案(expo-router、TS strict)、tokens.json、七基礎元件+EmptyState、Onboarding+四分頁骨架、i18next 雙語對稱、ESLint CJK 規則;tsc/Jest/lint 全綠;web 走查截圖 12 張(`.shots/`,gitignored;腳本 `scripts/web-walkthrough.py`,以 PMS 專案 `.blackvenv` 的 selenium 執行)
- **Phase 2 完成(2026-08-24,分支 feat/phase2-core,待驗收)**:SQLite(`db.native.ts` 平台檔)/InMemory(`db.ts` web)Repository、`domain/events` 純函式(重疊/跨午夜/合併/幾何)、todayStore CRUD+確認預測+streak、三檢視+週檢視接真資料、事件表單三模式(新增/確認/編輯)、點空白新增、長按進該日、空狀態。36 測試全綠;web CRUD 走查 9/9(`scripts/phase2-walkthrough.py`)
- 常用指令:`npm run lint` / `npm test` / `npx tsc --noEmit` / `npx expo start --web`
- 已知 web 限制:執行期分頁切換用直達 URL;資料層 web 走 InMemory(不持久化),native 走 SQLite
- **下一步:Phase 3**(例行工事 CRUD+統計四卡真計算+排程管理),見 docs/ROADMAP.md

## 文件地圖

| 文件 | 內容 |
|---|---|
| `docs/REQUIREMENTS.md` | 逐畫面功能需求(FR-ONB/TOD/EVT/DTC/RTN/STA/ADJ/SET/SCH/I18N 編號)與 NFR |
| `docs/ARCHITECTURE.md` | 技術棧定案、五層架構、資料模型、AI 服務模組(預測/偵測/通知) |
| `docs/DESIGN-SPEC.md` | 設計 token(色彩/字體/元件/動效)+ tokens.json |
| `docs/DESIGN-ADDENDUM.md` | 補充設計:排程管理 §A、空狀態 §B、語言切換 §C |
| `docs/I18N.md` | 英中雙語規劃、字串對照樣張、QA 檢查清單 |
| `docs/ROADMAP.md` | Phase 0–5 階段計畫與驗收檢查點 |

設計原型(互動規格最終依據):Claude Design 專案 `63891dbe-d2bd-46bc-b064-816c5dfb08f3` 的 `TimeCare.dc.html`——需專案擁有者權限,不在 repo 內;檔案與文件不一致時**以原型為互動依據、文件集為規格依據**,先修文件再修程式。

## 開發約定(務必遵守)

- **phase-gated**:每階段完成→向使用者展示驗收→核准後才 commit/push(固定 checkpoint)
- **雙語自第一天**:zh-TW(預設)/en-US;所有字串走 i18n key,禁止寫死(NFR-6);日期/時長/streak 用 Intl
- 文件風格:emoji 標題+`English · 中文` 雙語段標、`---` 分隔線;溝通語言 zh-Hant
- 技術棧(定案,勿擅自更換):Expo dev client、TypeScript strict、Zustand、expo-sqlite、expo-router、expo-notifications、expo-location、i18next、Jest+React Native Testing Library;工具鏈原則見 ARCHITECTURE.md

## 關鍵設計約束(實作時勿違反)

- **預測必經確認**:AI 一切猜測以虛線/待確認呈現,一鍵確認才轉正式;無把握就不猜(誠實失敗)
- **隱私優先**:位置停留偵測於裝置端處理,原始軌跡不上傳(NFR-1);資料本機 SQLite、離線優先
- 彈性先於紀律:彈性作息用區間取代時間點;非規律模式服務自由工作者
- 排程到點自動生成「待確認」事件(DESIGN-ADDENDUM §A4),銜接既有確認流程
