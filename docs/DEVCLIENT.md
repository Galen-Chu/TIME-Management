# 📱 Dev Client · 建置與真機驗收手冊

> 對應剩餘待辦①「dev client 建置」。工程側已於 2026-10-07 備妥:`expo-dev-client` 依賴、bundle id `com.galenchu.timecare`、`eas.json`(development/preview/production)。本手冊為維護者執行的建置步驟與真機驗收檢查表——目標是關閉優化 Batch 2 記錄的已知邊界:「提醒僅前景、背景定位/推播的 native 行為待 dev client 驗證」。

---

## 🧰 一次性設定 · Setup

1. EAS 帳號:至 [expo.dev](https://expo.dev) 註冊(free 方案每月建置額度足夠 dev client 使用)
2. 安裝 CLI:`npm install -g eas-cli`(或全部以 `npx eas-cli` 替代)
3. 登入:`eas login`
4. 綁定專案:repo 根目錄執行 `eas init`——會把 `extra.eas.projectId` 寫入 app.json(提交此變更)

---

## 🏗️ 建置 · Build

| 平台 | 指令 | 備註 |
|---|---|---|
| Android(建議先做) | `eas build --profile development --platform android` | 免開發者帳號;產出 APK 載點,手機直接安裝 |
| iOS(可後補) | `eas build --profile development --platform ios` | 需付費 Apple Developer 帳號($99/年),裝置須先註冊 |

- 首次雲端建置約 10–15 分鐘
- build 成功本身即驗證一件事:優化 Batch 1 移除 11 個依賴後,native build 無 missing native module

---

## 🚀 TestFlight · iPhone 自用上架(2026-11-24 拍板,工程側已備)

純自用走 **TestFlight 內部測試**:免 App 審查、免註冊裝置 UDID,單一 build 90 天有效,到期重新 build+submit 即可。原「dev client 真機驗收」待辦①併入此流程——以 production build 逐項跑下方檢查表。

### 前置(維護者)

1. Apple Developer Program 註冊([developer.apple.com/programs](https://developer.apple.com/programs/enroll/),99 USD/年;個人帳號通常 1 天內核准)
2. Expo 帳號([expo.dev](https://expo.dev) 免費)→ `eas login`
3. repo 根目錄執行 `eas init`——寫 `extra.eas.projectId` 進 app.json(提交此變更)

### 建置與上傳

| 步驟 | 指令/操作 | 備註 |
|---|---|---|
| 1 | `eas build --profile production --platform ios` | 首次會互動要求 Apple ID 登入;dist certificate 與 provisioning profile 由 EAS 自動建立管理(`eas credentials` 可查)。約 10–20 分鐘 |
| 2 | `eas submit --platform ios --latest` | 需 App Store Connect API key(ASC→使用者和存取→整合),或改用 Apple ID 互動登入 |
| 3 | App Store Connect 建立第一次的 App 記錄 | 名稱 TimeCare、primary language 繁體中文、bundle id `com.galenchu.timecare`、SKU 自訂(如 `timecare-001`) |
| 4 | ASC → 該 App → TestFlight → 內部測試 | 建立內部群組並把自己加為測試者(上限 100 人,自己用綽綽有餘) |
| 5 | iPhone 安裝 **TestFlight** App → 接受邀請 → 安裝 TimeCare | build 處理完成(約幾分鐘)即可安裝 |

> 已設定 `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`——匯出合規問答自動豁免,submit 後無需每年回覆加密問題。

### 真機驗收

安裝後以 **production build** 逐項跑下方「真機驗收檢查表」(8 項)——全數通過即關閉待辦①。production build 無 Metro 連線、無 dev menu,行為即上架行為;開發除錯仍可另行建置 development profile 的 dev client(見上節)。

### 版本更新

- build 號由 `eas.json` `production.autoIncrement` 自動遞增;App 版本號以 App Store Connect(remote,`appVersionSource: remote`)為準
- 每次更新 = 重新 `eas build` + `eas submit`;OTA(expo-updates)未引入,更新必經重建置
- **90 天到期**前重新上傳即可,資料不受影響(SQLite 於裝置端)

---

## 🔗 安裝與連線 · Install & Connect

1. 手機安裝 APK(Android 需允許「未知來源/安裝未知應用」)
2. 電腦執行 `npx expo start`,以 dev client 掃 QR(或輸入 URL)
3. App 載入即代表 Metro ↔ dev client 連線成功

---

## ✅ 真機驗收檢查表 · Verification Checklist

逐項通過後回填「結果」欄並提交;全數通過即關閉待辦①。

| # | 項目 | 操作 | 預期 | 結果 |
|---|---|---|---|---|
| 1 | native build 載入 | 裝 APK、連 Metro 開 App | 正常進 Onboarding/主畫面,無 missing module 紅屏 | ☐ |
| 2 | 通知權限請求 | 設定→通知風格=主動推播,建一個帶提醒的排程 | 首次出現系統權限對話框;授予後 leadTime 前收到系統通知 | ☐ |
| 3 | 溫和模式 | 通知風格=溫和建議 | 僅 App 內卡片,無系統通知 | ☐ |
| 4 | 權限拒絕降級 | 拒絕通知權限 | 降級為 App 內卡片,不崩潰 | ☐ |
| 5 | 免打擾抑制 | 開啟免打擾(22:00–07:00),手機時間調進時段 | 不推播,僅保留待確認卡片 | ☐ |
| 6 | 前景停留偵測 | 授予定位權限(僅使用期間),App 開著前景停留同一定點 45 分鐘(半徑 100m 內) | DetectionToast「查看並確認」→ 事件表單預填停留時段與地點(反向地理編碼;失敗顯示「未命名地點」) | ☐ |
| 7 | 提醒僅前景(已知邊界) | 提醒到點前把 App 切到背景 | 現況預期:背景中不觸發提醒——確認並記錄即可,背景排程屬後續功能 | ☐ |
| 8 | SQLite 持久化 | 新增事件→完全關閉 App→重開 | 事件仍在(migration v1–v3 正常) | ☐ |

> 第 6 項驗證捷徑:本地建置可暫調 `DWELL_MIN_MINUTES`(`src/services/detection.ts`,原型值 45)縮短等待;**此修改僅供驗證,勿提交**。

---

## 🚧 邊界 · Out of Scope(本輪不驗證)

- **背景定位**(geofence/foreground service)與**背景推播排程**——`location.native.ts` 明記「後續階段接入」;本輪驗證的是既有前景接線
- **OTA(expo-updates)未引入**——上架決策時一併評估
- iOS build 需 Apple Developer 帳號,時程由維護者決定

---

## 🧯 疑難排解 · Troubleshooting

- build 失敗:至 expo.dev 專案頁看完整 build log;常見原因為 app.json plugin 設定錯誤
- 想在本機建(免雲端排隊):`eas build --local`,需自備 Android SDK(進階)
- 裝了 dev client 後 Metro 預設連 dev client;Expo Go 與 dev client 不互通屬正常
