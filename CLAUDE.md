# CLAUDE.md

TimeCare · 24 小時時間管理 App(Galen-Chu/TIME-Management)。**開發完成(Phase 0–6 全數驗收,2026-08-31 收尾歸檔)**:Expo SDK 57 App 原始碼於 src/,開發文件集於 docs/;設計原型在 Claude Design(私有,見下方)。

## 專案現況(2026-08-31 收尾歸檔)

- 7 份開發文件定案並推送(root commit `48ec65b`):README + docs/{REQUIREMENTS, ARCHITECTURE, DESIGN-SPEC, DESIGN-ADDENDUM, I18N, ROADMAP}.md
- **Phase 0 完成**(含 repo 基礎設施:.gitignore、MIT LICENSE、main+feat/* 分支策略)
- **Phase 1 完成並驗收合併(2026-08-24,merge bf570e5;含回饋修正:Noto Sans TC 字型回落、正圓時鐘盤)**:Expo SDK 57 專案(expo-router、TS strict)、tokens.json、七基礎元件+EmptyState、Onboarding+四分頁骨架、i18next 雙語對稱、ESLint CJK 規則;tsc/Jest/lint 全綠;web 走查截圖 12 張(`.shots/`,gitignored;腳本 `scripts/web-walkthrough.py`,以 PMS 專案 `.blackvenv` 的 selenium 執行)
- **Phase 2 已驗收合併(aadcdd9)**:SQLite(`db.native.ts` 平台檔)/InMemory(`db.ts` web)Repository、`domain/events` 純函式(重疊/跨午夜/合併/幾何)、todayStore CRUD+確認預測+streak、三檢視+週檢視接真資料、事件表單三模式(新增/確認/編輯)、點空白新增、長按進該日、空狀態。36 測試全綠;web CRUD 走查 9/9(`scripts/phase2-walkthrough.py`)
- 常用指令:`npm run lint` / `npm test` / `npx tsc --noEmit` / `npx expo start --web`
- 已知 web 限制:執行期分頁切換用直達 URL;資料層 web 走 InMemory(不持久化),native 走 SQLite
- **Phase 3/4 已驗收合併(7745db6/db2a22a)**:prediction(規則式,敏感度門檻+彈性+非規律)、notification(leadTime/免打擾/排程到點)、detection(停留判定+Toast 流程)、smartTick 整合;86 測試全綠
- **Phase 0-5 全部完成並驗收合併(最終 merge 0b94e0a)**
- **Phase 6 完整驗收完成並合併(merge 5384cb0)**:docs/ACCEPTANCE.md 記錄 **132/132 全綠**(5 情境 36 步+86 回歸+雙語 E2E 10 項);2026-08-31 覆核 tsc/Jest 86/lint 全綠——**Phase 0–6 開發全程完成**
- **優化 Batch 1 已驗收合併(merge 78f186b,2026-08-31)**:P0 正確性修復(種子例行工事一次性播種、nextRoutineTime 日期感知、服務層雙語漏洞+no-raw-cjk 掃描測試、useNow 活時鐘)+ P4 清理(11 個未用依賴、死碼、重複邏輯收斂、noUnusedLocals、react-hooks lint、typecheck/verify scripts、GitHub Actions CI);**91/91 測試**、web export 全路由。後續批次:Batch 2=P0-1 預測接線+P0-2 通知/定位平台接線(需 dev client)、Batch 3=P1 錯誤處理、Batch 4=P2 效能、P3 測試補強
- **優化 Batch 2 已驗收合併(merge a0147a3,2026-08-31)**:P0-1 預測結果接線(`applyPredictedEvents` 冪等落地,§A4 sched-* id 冪等生效)+ P0-2 平台連接埠(方案 A:先接線,真機驗證留 dev client)——`services/location(.native)` expo-location 前景停留判定(NFR-1:軌跡僅記憶體)、`services/notify(.native)` NotifyPort(push→系統通知/降級卡片、gentle→App 內卡)、今天頁提醒編排+ReminderToast;jest.setup mock expo-notifications/expo-location(jest-expo 解析 .native.ts);**100/100 測試**。已知邊界:提醒僅前景、背景定位/推播排程與 native 行為待 dev client 驗證
- **優化 Batch 3 已驗收合併(merge 2a4101a,2026-08-31)**:P1 錯誤處理——todayStore `guard()` 包裹全部 11 個資料動作(`error` 狀態+`clearError`)、bootstrap try/catch(SQLite 失敗不再靜默空白)、ErrorBanner 頂部橫幅、根版面 ErrorBoundary(零新依賴);**104/104 測試**(新增 RNTL v14 慣例:`await render()`、查詢取自回傳值、事件 act 包裹)
- **優化 Batch 4 已驗收合併(merge 001da35,2026-08-31)**:P2 效能——6 處整店訂閱全改 selector(+adjust/settings)、todayStore 7 個 mutation 精準更新(不再全量 load,confirm 同步 weekEvents)、smart-tick 依賴收斂 `[date, events]`(getState 即時讀)、統計頁 useMemo;**104/104 測試**。todayStore 拆分評估為「不做」(selector+精準更新已解決粒度)
- **優化 Batch 5 已驗收合併(merge 1ab182d,2026-08-31)——優化系列(P0–P4)收官**:P3 測試補強——`data/migrations.ts` 抽離(介面注入,+4 測試)、format.ts Intl(+12)、畫面層 RNTL(+16:blocks/timeline/week/toasts,含勾選互動與空狀態);a11y 順手補 role/label。**132/132 測試(22 套組)**,每層皆有覆蓋;CI 全綠
- **優化系列完結(2026-08-31,五批全數驗收合併)**:測試 86 → 132、移除 11 依賴與 scaffold、錯誤處理/預測接線/平台連接埠/訂閱粒度完備。**剩餘待辦**(依優先序):① dev client 建置(驗證依賴移除後 native build+真機通知/定位+背景執行)② 彈性作息區間顯示(Event schema 擴充+SQLite migration v4)③「刪除排程自動事件不再重生」產品決策(需 dismissed 記錄)④ web 資料持久化(若 web 為正式交付目標)

## 文件地圖

| 文件 | 內容 |
|---|---|
| `docs/REQUIREMENTS.md` | 逐畫面功能需求(FR-ONB/TOD/EVT/DTC/RTN/STA/ADJ/SET/SCH/I18N 編號)與 NFR |
| `docs/ARCHITECTURE.md` | 技術棧定案、五層架構、資料模型、AI 服務模組(預測/偵測/通知) |
| `docs/DESIGN-SPEC.md` | 設計 token(色彩/字體/元件/動效)+ tokens.json |
| `docs/DESIGN-ADDENDUM.md` | 補充設計:排程管理 §A、空狀態 §B、語言切換 §C |
| `docs/I18N.md` | 英中雙語規劃、字串對照樣張、QA 檢查清單 |
| docs/ROADMAP.md | Phase 0–6 階段計畫與驗收檢查點 |
| docs/ACCEPTANCE.md | Phase 6 完整驗收測試計畫(5 情境+86 回歸+E2E) |

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
