# Headless Vercel - Web Desktop OS

一個基於 Next.js 14 與 React 18 構建的仿桌面作業系統介面，整合了 Shopify Headless Commerce 與多媒體互動功能。

## 🏗️ 技術架構 (Tech Stack)

* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **State Management**: Zustand (with Persist Middleware)
* **Window Manager**: WinBox.js (via React wrapper)
* **Commerce**: Shopify Storefront API (GraphQL)
* **PDF Rendering**: react-pdf (w/ custom worker setup)
* **Testing**: Playwright (E2E)

## 🧩 核心模組 (Widgets)

目前已實作以下 Widget：

1.  **Product Suite (Commerce Context)**
    * 整合 Shopify Storefront API。
    * 動態獲取商品圖片、標題、描述。
    * 狀態記憶：包含字體大小、顯示設定等。

2.  **Media Player (Content Context)**
    * 支援 HTML5 Video 播放。
    * **跨組件協作**：Visualiser (畫面)、Playback (控制)、EQ Mixer (音量) 分離設計。
    * **狀態持久化**：記憶播放進度與音量，刷新後自動恢復。

3.  **PDF Viewer (Asset Context)**
    * 基於 `react-pdf` v9/v10。
    * 支援分頁瀏覽、縮放。
    * 解決了 Worker 載入與 `Promise.withResolvers` 相容性問題。

## 🛠️ 重要配置說明 (Critical Configurations)

為了相容部分第三方庫與 Next.js 14 的構建機制，本專案包含以下特殊配置，**請勿隨意刪除**：

### 1. Polyfills (`app/polyfills.js`)
用於解決 `pdfjs-dist` 在部分瀏覽器或 Node 環境缺少的 `Promise.withResolvers` API。
必須在 `app/layout.tsx` 的**第一行**引入。

### 2. Next.js Config & Webpack (`next.config.mjs`)
* **TopLevelAwait**: 啟用以支援 ESM 模組。
* **Canvas Alias**: 將 `canvas` 指向 `false` 以避免 SSR 錯誤。
* **DevTool Fix**: 禁用 `eval-source-map` 並手動配置 `EvalSourceMapDevToolPlugin`，以解決 PDF Worker 路徑解析錯誤 (404/undefined)。

### 3. Static Assets
PDF Worker 檔案位於 `public/pdf.worker.mjs`，這是為了繞過 Webpack 打包路徑問題的最終手段。

## 📂 專案結構
app/ 
├── components/ 
│ ├── system/ # 系統級 UI (Launcher, Taskbar) 
│ ├── widgets/ # 具體應用 (Product, Video, PDF) 
│ ├── workspace/ # 桌面容器 
│ └── ui/ # 通用元件 (WinboxWrapper) 
├── lib/ 
│ ├── services/ # 業務邏輯 (ScenarioService) 
│ ├── constants/ # 設定常數 (Layouts) 
│ └── persistence/ # 存檔邏輯 
├── store/ # Zustand Stores 
└── hooks/ # Custom Hooks (useShopify, useWidgetState)

## 🚀 Getting Started

```bash
# 安裝依賴 (建議使用 npm 以確保 lockfile 一致)
npm install

# 設定環境變數 (.env.local)
NEXT_PUBLIC_SHOPIFY_DOMAIN=...
NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN=...

# 啟動開發伺服器
npm run dev


### ✅ 執行檢查

請執行以下步驟驗證重構成果：

1.  **Singleton 測試**：
    * 點擊 "Open Video Studio"。
    * 再次點擊 "Open Video Studio"。
    * **預期**：跳出 Alert 警告，且不會開啟第二組視窗。
2.  **功能回歸測試**：
    * 點擊 "Open Product Suite" -> 確認商品描述是否正常載入。
    * 點擊 "Open PDF" -> 確認 PDF 是否正常顯示且無 404 錯誤。
3.  **代碼整潔度**：
    * 檢查 `Desktop.tsx` 是否變乾淨了。
    * 檢查 `ScenarioService.ts` 裡的魔術數字是否消失。