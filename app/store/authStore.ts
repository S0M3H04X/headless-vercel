import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  customerAccessToken: string | null;
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
  customerAccessToken: null,
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
                customerAccessToken: data.accessToken || null,
                isLoading: false,
                user: { name: 'Member' } // 暫時 Mock，未來可從 API 獲取
            });
        } else {
            set({ isAuthenticated: false, customerAccessToken: null, isLoading: false, user: null });
        }
      } else {
        // 401 或其他錯誤視為未登入
        set({ isAuthenticated: false, customerAccessToken: null, isLoading: false, user: null });
      }
    } catch (error) {
      console.error('[AuthStore] Check failed', error);
      set({ isAuthenticated: false, customerAccessToken: null, isLoading: false, user: null });
    }
  },

  login: () => {
    // 全頁重導向至後端登入路由
    window.location.href = '/api/auth/login';
  },

  logout: async () => {
    try {
        // [新增] 呼叫後端清除 Cookie
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout failed:', e);
    } finally {
        // 無論後端成功與否，前端都要重置狀態
        set({ isAuthenticated: false, customerAccessToken: null, user: null });
        // 可選：強制重整頁面以確保乾淨
        window.location.reload(); 
    }
  }
}));