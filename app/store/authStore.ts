import { create } from 'zustand';
import { useCartStore } from './cartStore';

interface AuthState {
  isAuthenticated: boolean;
  // customerAccessToken: string | null;
  isLoading: boolean;
  user: {
    // name?: string;
    email?: string;
  } | null; // 預留未來擴充 User Info
  
  isAuthOpen: boolean;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>; // 暫時只做前端狀態清除
  closeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  // customerAccessToken: null,
  isLoading: true, // 初始狀態設為 true，避免畫面閃爍
  user: null,
  isAuthOpen: false,

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
            // customerAccessToken: data.accessToken || null,
            isLoading: false,
            user: data.user 
          });
          // [Trigger] US-08-02: 登入成功，立即綁定購物車
          // 這會確保如果此瀏覽器已經有殘留的 cartId，它會被歸戶給這個使用者
          if (data.user?.email) {
            useCartStore.getState().associateUser(data.accessToken, data.user?.email);
          }
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
    set({ isAuthOpen: true });
  },

  closeAuth: () => {
    set({ isAuthOpen: false });
  },

  logout: async () => {
    try {
        // [新增] 呼叫後端清除 Cookie
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout failed:', e);
    } finally {
        // 無論後端成功與否，前端都要重置狀態
        set({ isAuthenticated: false, user: null });
        // 可選：強制重整頁面以確保乾淨
        window.location.reload(); 
    }
  }
}));