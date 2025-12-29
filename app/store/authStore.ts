import { create } from 'zustand';
import { useCartStore } from './cartStore';
import { useMembershipStore } from './membershipStore';
import { MembershipTier } from '@/lib/types/permissions';

interface AuthState {
  isAuthenticated: boolean;
  customerAccessToken?: string | null; // [保留] 用於 Shopify Customer API
  isLoading: boolean;
  user: {
    name?: string;          // [保留] 顯示名稱
    firstName?: string;     // [保留] 用於 UserProfileWidget
    lastName?: string;      // [保留] 用於 UserProfileWidget
    email?: string;
    membershipTier?: MembershipTier; // [新增] 會員等級
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
          // [新增] 從後端取得會員等級，預設為 tier1 (已登入用戶)
          const tier: MembershipTier = data.user?.membershipTier || 'tier1';

          set({
            isAuthenticated: true,
            // customerAccessToken: data.accessToken || null,
            isLoading: false,
            user: { ...data.user, membershipTier: tier }
          });

          // [新增] 同步會員等級到 membershipStore
          useMembershipStore.getState().setTier(tier);

          // [Trigger] US-08-02: 登入成功，立即綁定購物車
          // 這會確保如果此瀏覽器已經有殘留的 cartId，它會被歸戶給這個使用者
          if (data.user?.email) {
            useCartStore.getState().associateUser(data.accessToken, data.user?.email);
          }
        } else {
          set({ isAuthenticated: false, isLoading: false, user: null });
          // [新增] 未登入用戶設為 guest
          useMembershipStore.getState().setTier('guest');
        }
      } else {
        // 401 或其他錯誤視為未登入
        set({ isAuthenticated: false, isLoading: false, user: null });
        useMembershipStore.getState().setTier('guest');
      }
    } catch (error) {
      console.error('[AuthStore] Check failed', error);
      set({ isAuthenticated: false, isLoading: false, user: null });
      useMembershipStore.getState().setTier('guest');
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
      // [新增] 登出時重置會員等級為 guest
      useMembershipStore.getState().setTier('guest');
      // 可選：強制重整頁面以確保乾淨
      window.location.reload();
    }
  }
}));