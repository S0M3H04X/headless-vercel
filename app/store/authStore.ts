import { create } from 'zustand';
import { useCartStore } from './cartStore';
import type { UserTier } from '@/lib/utils/tierUtils';
import { WorkspaceRepository } from '@/lib/persistence/storage';

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

          // [Sync] Restore workspace state from DB
          try {
            const stateRes = await fetch('/api/auth/state');
            if (stateRes.ok) {
              const { state } = await stateRes.json();
              if (state) {
                console.log('[AuthStore] Restoring workspace state from DB');
                WorkspaceRepository.save(state);
                // Note: We might need to trigger a window reload or signal the OS to re-read storage 
                // if this happens after the OS has already booted. 
                // However, checkAuth usually runs early. 
                // If hot-reloading state is needed, we'd need a way to push it to the running OS.
                // For now, assuming checkAuth happens on boot.
              }
            }
          } catch (e) {
            console.error('[AuthStore] Failed to restore state:', e);
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
      // [Sync] Save workspace state to DB before logout
      const currentWorkspace = WorkspaceRepository.load();
      if (currentWorkspace) {
        console.log('[AuthStore] Saving workspace state to DB...');
        await fetch('/api/auth/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: currentWorkspace })
        });
      }

      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      set({ isAuthenticated: false, tier: 'guest', user: null });
      window.location.reload();
    }
  }
}));