// app/store/workspaceStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { WindowInstance, CreateWindowParams } from '@/lib/types/workspace';

interface WorkspaceState {
  windows: Record<string, WindowInstance>; // ID -> Instance Map
  stackOrder: string[]; // 儲存 ID 順序，最後一個是 Top (Highest Z-Index)
  
  // Actions (高內聚：只能透過這些方法修改狀態)
  openWindow: (params: CreateWindowParams) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateGeometry: (id: string, geometry: Partial<WindowInstance['geometry']>) => void;
  minimizeWindow: (id: string, minimized: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  windows: {},
  stackOrder: [],

  openWindow: ({ title, content, initialGeometry }) => {
    const id = uuidv4();
    const defaultGeo = { x: 50, y: 50, width: 400, height: 300 };
    
    const newWindow: WindowInstance = {
      id,
      title,
      geometry: { ...defaultGeo, ...initialGeometry },
      zIndex: 0, // 會由 focusWindow 自動計算
      isMinimized: false,
      content,
      internalState: {},
    };

    set((state) => {
      // 開啟新視窗時，自動置頂
      const newStack = [...state.stackOrder, id];
      return {
        windows: { ...state.windows, [id]: newWindow },
        stackOrder: newStack,
      };
    });
    
    // 觸發一次 Focus 以更新 Z-Index
    get().focusWindow(id);
  },

  closeWindow: (id) => {
    set((state) => {
      const { [id]: _, ...remainingWindows } = state.windows;
      return {
        windows: remainingWindows,
        stackOrder: state.stackOrder.filter((wId) => wId !== id),
      };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      // 將該 ID 移到 Stack 的最後面 (Top)
      const newStack = state.stackOrder.filter((wId) => wId !== id);
      newStack.push(id);
      
      // 根據 Stack 順序重新分配 Z-Index
      // 這裡實現了 Workspace 對 Viewport 層級的絕對控制
      const updatedWindows = { ...state.windows };
      newStack.forEach((wId, index) => {
        if (updatedWindows[wId]) {
          updatedWindows[wId] = { ...updatedWindows[wId], zIndex: 10 + index };
        }
      });

      return { stackOrder: newStack, windows: updatedWindows };
    });
  },

  updateGeometry: (id, geometry) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return {};
      return {
        windows: {
          ...state.windows,
          [id]: { ...win, geometry: { ...win.geometry, ...geometry } },
        },
      };
    });
  },

  minimizeWindow: (id, minimized) => {
     set((state) => {
      const win = state.windows[id];
      if (!win) return {};
      return {
        windows: {
            ...state.windows,
            [id]: { ...win, isMinimized: minimized }
        }
      }
     })
  }
}));