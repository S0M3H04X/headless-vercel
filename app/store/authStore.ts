import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    name?: string;
    email?: string;
  } | null; // 預留未來擴充 User Info
  
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => void; // 暫時只做前端狀態清除
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true, // 初始狀態設為 true，避免畫面閃爍
  user: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');
      
      if (res.ok) {
        const data = await res.json();
        // 如果後端回傳 { authenticated: true }
        if (data.authenticated) {
            set({ 
                isAuthenticated: true, 
                isLoading: false,
                user: { name: 'Member' } // 暫時 Mock，未來可從 API 獲取
            });
        } else {
            set({ isAuthenticated: false, isLoading: false, user: null });
        }
      } else {
        // 401 或其他錯誤視為未登入
        set({ isAuthenticated: false, isLoading: false, user: null });
      }
    } catch (error) {
      console.error('[AuthStore] Check failed', error);
      set({ isAuthenticated: false, isLoading: false, user: null });
    }
  },

  login: () => {
    // 全頁重導向至後端登入路由
    window.location.href = '/api/auth/login';
  },

  logout: () => {
    // 這裡暫時只處理前端，Step 2.5 會加入後端 API 呼叫
    set({ isAuthenticated: false, user: null });
    // 清除 Cookie 的動作需由後端完成，或是手動清除 Document Cookie (但 HttpOnly JS 刪不掉)
    // 所以現階段這只是 UI 變更，重新整理後可能又會變回登入狀態 (如果 Cookie 還在)
    console.log('[AuthStore] Frontend logout triggered');
  }
}));