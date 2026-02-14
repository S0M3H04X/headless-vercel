import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WindowInstance, ContentDescriptor } from '@/lib/types/workspace';
import { AnalyticsService } from '@/lib/services/analytics';

interface WorkspaceState {
  windows: Record<string, WindowInstance>;
  stackOrder: string[];
  // [新增] 系統狀態
  installedApps: string[]; // 當前用戶可用的 App ID 清單
  isBooted: boolean;
  isMissionControlActive: boolean;

  openWindow: (params: { title: string; content: ContentDescriptor; initialGeometry?: any }) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  focusOrOpenWindow: (params: { title: string; content: ContentDescriptor; initialGeometry?: any }) => void;
  updateWindowGeometry: (id: string, geometry: any) => void;
  updateInternalState: (id: string, stateUpdate: Record<string, any>) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  bootSystem: (config: any) => void;
  updateWindowTitle: (id: string, title: string) => void;
  updateWindowContent: (id: string, content: ContentDescriptor) => void;
  toggleMissionControl: () => void;

}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      windows: {},
      stackOrder: [],

      // [新增] 預設狀態
      installedApps: [],
      isBooted: false,
      isMissionControlActive: false,
      bootSystem: (config) => {
        const { dock, autoStart } = config;

        set((state) => {
          // 策略 C (Hybrid):
          // 1. Dock (Installed Apps) -> 強制使用 Server 設定
          const newApps = dock || ['launcher', 'profile', 'media_player', 'cart', 'pdf_viewer'];

          // 2. Windows -> 檢查 LocalStorage 是否有殘留視窗
          const hasExistingWindows = Object.keys(state.windows).length > 0;
          let newWindows = { ...state.windows };
          let newStack = [...state.stackOrder];

          // 若是用戶首次訪問 (無殘留視窗)，則執行 autoStart
          if (!hasExistingWindows && autoStart && autoStart.length > 0) {
            autoStart.forEach((winConfig: any) => {
              // 這裡簡化邏輯，需呼叫內部的 openWindow 邏輯 (或在 Component 層處理)
              // 為保持 Store 純粹，我們通常建議由 Component 觸發 openWindow
              // 但為了方便，我們可以在這裡標記 "pendingAutoStart" 讓 UI 處理
              // 或者直接在這裡操作 windows 物件 (需引入 uuid)
            });
          }

          return {
            installedApps: newApps,
            isBooted: true,
            // windows 與 stackOrder 保持 LocalStorage 的狀態 (除非我們決定清除)
          };
        });
      },

      openWindow: ({ title, content, initialGeometry }) => {

        const id = `win_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const defaultGeometry = { x: 50, y: 50, width: 400, height: 300 };

        // Phase5-3: 視窗開啟事件追蹤
        AnalyticsService.track('window_open', {
          window_id: id,
          title: title,
          kind: content.kind,
          source_id: content.sourceId
        });
        // ----------------------------------

        const newWindow: WindowInstance = {
          id,
          title,
          content,
          geometry: initialGeometry || defaultGeometry,
          zIndex: get().stackOrder.length + 1,
          isMinimized: false,
          internalState: {
            _openTime: Date.now(),
          },
        };



        set((state) => ({
          windows: { ...state.windows, [id]: newWindow },
          stackOrder: [...state.stackOrder, id],
        }));
      },

      closeWindow: (id) => {
        // --- Phase5-3 視窗關閉事件追蹤 ---
        const win = get().windows[id];
        if (win) {
          const openTime = (win.internalState as any)?._openTime || Date.now();
          const duration = (Date.now() - openTime) / 1000; // 秒

          AnalyticsService.track('window_close', {
            window_id: id,
            title: win.title,
            kind: win.content.kind,
            duration_seconds: duration
          });
        }
        // ----------------------------------

        set((state) => {
          const { [id]: removed, ...others } = state.windows;
          return {
            windows: others,
            stackOrder: state.stackOrder.filter((winId) => winId !== id),
          };
        });
      },

      focusWindow: (id) => {
        set((state) => {
          const newStack = state.stackOrder.filter((w) => w !== id);
          newStack.push(id);

          const updatedWindows = { ...state.windows };
          newStack.forEach((winId, index) => {
            if (updatedWindows[winId]) {
              updatedWindows[winId] = { ...updatedWindows[winId], zIndex: index + 1 };
            }
          });

          return { stackOrder: newStack, windows: updatedWindows, isMissionControlActive: false };
        });
      },

      focusOrOpenWindow: (params) => {
        const { windows, focusWindow, openWindow } = get();
        // 根據 kind 尋找是否已存在相同類型的視窗
        const existingWindow = Object.values(windows).find(
          (w) => w.content.kind === params.content.kind
        );

        if (existingWindow) {
          focusWindow(existingWindow.id);
        } else {
          openWindow(params);
        }
      },

      updateWindowGeometry: (id, geometry) => {
        set((state) => {
          const win = state.windows[id];
          if (!win) return {}; // 必須回傳物件以符合型別
          return {
            windows: {
              ...state.windows,
              [id]: { ...win, geometry: { ...win.geometry, ...geometry } },
            },
          };
        });
      },

      updateInternalState: (id, stateUpdate) => {
        set((state) => {
          const win = state.windows[id];
          if (!win) return {};
          return {
            windows: {
              ...state.windows,
              [id]: {
                ...win,
                internalState: { ...(win.internalState as object), ...stateUpdate }
              },
            },
          };
        });
      },

      minimizeWindow: (id) => {
        set((state) => {
          const win = state.windows[id];
          if (!win) return {};
          return {
            windows: {
              ...state.windows,
              [id]: { ...win, isMinimized: true }
            }
          };
        });
      },

      restoreWindow: (id) => {
        set((state) => {
          const win = state.windows[id];
          if (!win) return {};
          return {
            windows: {
              ...state.windows,
              [id]: { ...win, isMinimized: false }
            }
          };
        });
        get().focusWindow(id);
      },
      updateWindowContent: (id, content) => {
        set((state) => {
          const win = state.windows[id];
          if (!win) return {};
          return {
            windows: {
              ...state.windows,
              [id]: { ...win, content },
            },
          };
        });
      },
      updateWindowTitle: (id, title) => {
        set((state) => {
          const win = state.windows[id];
          if (!win) return {};
          return {
            windows: {
              ...state.windows,
              [id]: { ...win, title },
            },
          };
        });
      },
      toggleMissionControl: () => {
        set((state) => ({ isMissionControlActive: !state.isMissionControlActive }));
      },
    }),
    {
      name: 'headless-workspace-storage',
      // [重要] 設定 persist 白名單，確保 installedApps 不被持久化 (每次開機都要重抓)
      // 或者：我們希望它持久化以加速下次載入？
      // 建議：只持久化 windows，installedApps 每次重抓以確保權限正確
      partialize: (state) => ({ windows: state.windows, stackOrder: state.stackOrder }),
    }
  )
);