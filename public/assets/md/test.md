
|**欄位**|**內容**|
|---|---|
|**目標**|讓 OS 啟動時向 `/api/os/boot` 請求設定檔，而非讀取前端靜態常數。|
|**價值**|實現「千人千面」的桌面體驗（會員有專屬 App）、允許後端動態開關功能（Feature Flag）。|
|**依賴**|US-07-01 (BFF Auth)，因為 Boot API 需要根據 Session Cookie 判斷回傳內容。|
#### 1. 設定檔的「資料來源」 (Data Source)

目前我們尚未正式接入 Turso/SQLite 資料庫。針對 Phase 7，您希望這個 `/api/os/boot` 的資料來源是：

- **選項 A (Hardcoded Logic)**：直接在 API Route (`route.ts`) 內寫死 switch-case 邏輯 (e.g., `if (user) return MEMBER_LAYOUT else return GUEST_LAYOUT`)。這是最快做法，符合「遷移邏輯至後端」的目標。
- **選項 B (JSON File)**：讀取伺服器端的一個 `config/layouts.json` 檔案。
- **選項 C (Database)**：必須在這個階段引入資料庫 (Turso) 並從 Table 讀取。
    

> **建議**：考慮到這只是 Phase 7 (Migration)，**選項 A** 最具成本效益，待 Phase 8 再接入真實 DB。

#### 2. 「用戶自定義佈局」與「伺服器佈局」的衝突策略

目前 `workspaceStore` 會將視窗位置存入 `LocalStorage`。當用戶「動態開機」時：

- **策略 A (Server Authoritative)**：**強制覆寫**。每次重整都恢復成伺服器指定的「原廠設定」。
    
- **策略 B (Client Priority)**：**用戶優先**。若 LocalStorage 有紀錄，使用 LocalStorage；若無（或清除快取後），才使用伺服器回傳的 Layout。
    
- **策略 C (Hybrid)**：**混合模式**。`Dock` (應用程式清單) 強制由伺服器決定（確保權限正確），但 `Windows` (視窗位置) 優先讀取 LocalStorage。
    

> **建議**：**策略 C**。這能同時確保權限控管 (Server) 與用戶體驗 (Client Persistence)。

#### 3. 角色區分 (Role Definition)

我們需要區分哪幾種角色佈局？

- **Guest (訪客)**: 只有 Login, About, Product Browser?
    
- **Member (會員)**: 增加 My Account, Cart?
    
- **VIP (特殊)**: 是否需要針對特定 Tag 的會員開啟特殊 App (如 Video Studio)?
    

> **目前假設**：暫時只區分 **Guest** 與 **Member** 兩種即可？

#### 4. 啟動體驗 (Boot UX)

當前端在等待 `/api/os/boot` 回傳時 (約 200-500ms)，畫面應該顯示什麼？

- **選項 A**: 顯示全白/全黑畫面直到載入完成。
    
- **選項 B**: 顯示一個「開機中 (Booting...)」的 Loading Spinner 或 Logo。
    
- **選項 C**: 先顯示預設骨架 (Skeleton)，載入後再變更 (可能會閃爍)。
- 

JSON
// GET /api/os/boot
{
  "role": "member",
  "theme": {
    "wallpaper": "default",
    "primaryColor": "#000000"
  },
  "apps": {
    "dock": ["launcher", "browser", "cart", "profile"], // Dock 上的圖示
    "registry": ["launcher", "browser", "cart", "profile", "video-studio"] // 用戶有權限開啟的所有 App ID
  },
  "autoStart": [ // 開機自動開啟的視窗
    { "id": "welcome-window", "appId": "about", "x": "center", "y": "center" }
  ]
}

1. 設定檔的「資料來源」 (Data Source) ：
	1. 問題：「**選項 B (JSON File)**：讀取伺服器端的一個 `config/layouts.json` 檔案」所需的成本？
2. 「用戶自定義佈局」與「伺服器佈局」的衝突策略：
	1. 採用「**策略 C (Hybrid)**：**混合模式**。`Dock` (應用程式清單) 強制由伺服器決定（確保權限正確），但 `Windows` (視窗位置) 優先讀取 LocalStorage」
3. 角色區分 (Role Definition)：
	1. 暫時區分 **Guest** , **Member** 及 Admin 三種，未來可擴展
4. 啟動體驗 (Boot UX)：
	1. 採用「 **選項 B** + 登入 / 註冊 (Login/Register) 視窗開機自動開啟」