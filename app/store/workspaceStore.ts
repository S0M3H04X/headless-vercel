import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WindowInstance, ContentDescriptor } from '@/lib/types/workspace';

interface WorkspaceState {
  windows: Record<string, WindowInstance>;
  stackOrder: string[];
  
  openWindow: (params: { title: string; content: ContentDescriptor; initialGeometry?: any }) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowGeometry: (id: string, geometry: any) => void;
  updateInternalState: (id: string, stateUpdate: Record<string, any>) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  
  // [刪除] 移除 hydrate 定義
  // hydrate: (snapshot: any) => void; 
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      windows: {},
      stackOrder: [],

      // [刪除] 移除 hydrate 實作
      /* hydrate: (snapshot) => {
        set({ windows: snapshot.windows, stackOrder: snapshot.stackOrder });
      },
      */

      openWindow: ({ title, content, initialGeometry }) => {
        // ... (保持不變)
        const id = `win_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const defaultGeometry = { x: 50, y: 50, width: 400, height: 300 };
        
        const newWindow: WindowInstance = {
          id,
          title,
          content,
          geometry: initialGeometry || defaultGeometry,
          zIndex: get().stackOrder.length + 1,
          isMinimized: false,
          internalState: {},
        };

        set((state) => ({
          windows: { ...state.windows, [id]: newWindow },
          stackOrder: [...state.stackOrder, id],
        }));
      },

      closeWindow: (id) => {
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

          return { stackOrder: newStack, windows: updatedWindows };
        });
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
      }
    }),
    {
      name: 'headless-os-workspace',
    }
  )
);