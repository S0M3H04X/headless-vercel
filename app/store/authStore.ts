import { create } from 'zustand';
import { useCartStore } from './cartStore';
import type { UserTier } from '@/lib/utils/tierUtils';

interface AuthState {
  isAuthenticated: boolean;
  tier: UserTier;
  isLoading: boolean;
  user: {
    email?: string;
    tier?: UserTier; // From backend
  } | null;

  isAuthOpen: boolean;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
  closeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  tier: 'guest',
  isLoading: true,
  user: null,
  isAuthOpen: false,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          // Determine tier: default to 'member', upgrade if backend provides tier
          const userTier: UserTier = data.user?.tier || 'member';

          set({
            isAuthenticated: true,
            tier: userTier,
            isLoading: false,
            user: data.user
          });

          // [Trigger] US-08-02: 登入成功，立即綁定購物車
          if (data.user?.email) {
            useCartStore.getState().associateUser(data.accessToken, data.user?.email);
          }
        } else {
          set({ isAuthenticated: false, tier: 'guest', isLoading: false, user: null });
        }
      } else {
        set({ isAuthenticated: false, tier: 'guest', isLoading: false, user: null });
      }
    } catch (error) {
      console.error('[AuthStore] Check failed', error);
      set({ isAuthenticated: false, tier: 'guest', isLoading: false, user: null });
    }
  },

  login: () => {
    set({ isAuthOpen: true });
  },

  closeAuth: () => {
    set({ isAuthOpen: false });
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      set({ isAuthenticated: false, tier: 'guest', user: null });
      window.location.reload();
    }
  }
}));