# Headless Vercel - Web Desktop OS

一個基於 Next.js App Router 與 Zustand 的視窗化作業系統模擬器 (Window Manager)。
整合了 Shopify Headless Commerce、Serverless Python Analytics 與 PDF 閱讀功能。

## 🚀 功能特色 (Features)

### 1. Window Management
* 視窗拖曳、縮放、最小化、關閉。
* 狀態持久化 (LocalStorage) 與 堆疊管理 (Z-Index)。

### 2. Widget Ecosystem
* **Commerce (Shopify)**: 透過 Storefront API 獲取即時商品資訊。
* **Video Studio**: 多視窗協作 (Visualiser/Control/Mixer) 與 狀態同步。
* **Digital Assets (PDF)**: 解決 Worker 載入問題並記憶閱讀頁碼。

### 3. System Intelligence (Phase 5 New!)
* **Hybrid Architecture**: Next.js (Frontend) + Python (Backend) 同步運行於 Vercel。
* **Telemetry**: 使用 `navigator.sendBeacon` 實作無阻塞的用戶行為追蹤 (視窗開啟/關閉/停留時間)。
* **Compute**: Python FastAPI 負責處理日誌聚合與分析運算。

## 🛠️ 技術架構 (Tech Stack)

* **Frontend**: Next.js 14, Zustand (Persist), Winbox.js, TailwindCSS
* **Backend**: Python 3.12, FastAPI, Pydantic (Serverless Functions)
* **Database**: (Planned) Turso / LibSQL

## 📂 專案結構

```bash
app/
├── api/                # Next.js Route Handlers (Auth, Proxy)
├── components/         # React Components
├── lib/
│   ├── services/       # 業務邏輯 (Scenario, Analytics)
│   └── ...
└── store/              # Zustand Stores
api/                    # Python Serverless Functions
├── index.py            # FastAPI Entry Point
└── db.py               # Database Connection

```

# Headless OS (React PWA)

... (保留原有內容)

## ✅ TODO List

- [x] Phase 1-4: Core Window Manager & Widgets
- [x] Phase 5: System Intelligence (Hybrid Architecture)
  - [x] Vercel Hybrid Deployment
  - [x] Analytics Pipeline
  - [x] Headless Auth (PKCE & Lifecycle)
- [ ] Phase 6: Global System Features
  - [x] US-06-01: Top Menu Bar (Mac OS 9 Style)
  - [x] US-06-Refactor: System Service & UI Decoupling
  - [ ] **US-06-02: Cart & Checkout** (Headless Cart API Integration)
  - [ ] **US-06-03: My Account** (Order History & Profile Management)

## 🚧 Phase 7: Backend Migration & Hardening (Planned)
*為了提升安全性與業務邏輯的擴展性，以下邏輯將從前端遷移至 Python/Next.js 後端 API：*

1.  **Time-Gated Access Control (時效性權限)**:
    * **現狀**: 資料夾/活動的開放時間判斷寫在前端。
    * **目標**: 建立 `/api/os/resource/check`，由後端驗證 Server Time 與 User Role。
2.  **Shopify BFF (Backend for Frontend)**:
    * **現狀**: 前端直接呼叫 Shopify Storefront API。
    * **目標**: 建立 `/api/shopify/query` 中介層，處理 Caching、Rate Limiting 與資料清洗 (Data Sanitization)。
3.  **Dynamic Boot Sequence (動態開機程序)**:
    * **現狀**: App Registry 是靜態編譯的。
    * **目標**: 建立 `/api/os/boot`，根據用戶權限動態回傳可用 Widget 清單。
4.  **Asset Streaming (細粒度資源控制)**:
    * **現狀**: PDF/影片為靜態檔案下載。
    * **目標**: 實作 `/api/assets/stream`，支援分頁讀取與權限驗證 (e.g. 非付費用戶僅能讀取前 3 頁)。



