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
  customerAccessToken: string | null;
  avatarSeed: string | null;

  isAuthOpen: boolean;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
  closeAuth: () => void;
  setAvatarSeed: (seed: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  tier: 'guest',
  isLoading: true,
  user: null,
  customerAccessToken: null,
  avatarSeed: null,
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
            user: data.user,
            customerAccessToken: data.accessToken
          });

          // [Trigger] US-08-02: 登入成功，立即綁定購物車
          if (data.user?.email) {
            useCartStore.getState().associateUser(data.accessToken, data.user?.email);
          }

          // [Avatar] Fetch or initialize avatar seed from Turso
          try {
            const avatarRes = await fetch('/api/auth/avatar');
            if (avatarRes.ok) {
              const { avatarSeed } = await avatarRes.json();
              if (avatarSeed) {
                set({ avatarSeed });
              } else if (data.user?.email) {
                // First login — persist email as the avatar seed
                const seed = data.user.email;
                await fetch('/api/auth/avatar', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ avatarSeed: seed })
                });
                set({ avatarSeed: seed });
              }
            }
          } catch (e) {
            console.error('[AuthStore] Avatar sync failed:', e);
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
          set({ isAuthenticated: false, tier: 'guest', isLoading: false, user: null, customerAccessToken: null, avatarSeed: null });
        }
      } else {
        set({ isAuthenticated: false, tier: 'guest', isLoading: false, user: null, customerAccessToken: null, avatarSeed: null });
      }
    } catch (error) {
      console.error('[AuthStore] Check failed', error);
      set({ isAuthenticated: false, tier: 'guest', isLoading: false, user: null, customerAccessToken: null, avatarSeed: null });
    }
  },

  login: () => {
    set({ isAuthOpen: true });
  },

  closeAuth: () => {
    set({ isAuthOpen: false });
  },

  setAvatarSeed: async (seed: string) => {
    try {
      await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarSeed: seed })
      });
      set({ avatarSeed: seed });
    } catch (e) {
      console.error('[AuthStore] Failed to update avatar seed:', e);
    }
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
      set({ isAuthenticated: false, tier: 'guest', user: null, customerAccessToken: null, avatarSeed: null });
      // [Cleanup] Clear local persistence to prevent state leaking to next user
      localStorage.removeItem('headless-cart-storage');
      localStorage.removeItem('headless-workspace-storage');
      window.location.reload();
    }
  }
}));