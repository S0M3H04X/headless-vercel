import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';

// 模擬 global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

// 模擬 window location (避免測試環境報錯)
const mockLocation = {
  href: '',
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('AuthStore', () => {
  // 每個測試前重置 Store 狀態與 Mock
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      customerAccessToken: null,
      isLoading: true, // 根據您的源碼，初始值為 true
      user: null,
    });
    vi.clearAllMocks();
  });

  it('TC-01: 初始化狀態應正確', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.customerAccessToken).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('TC-02: checkAuth 成功時應更新狀態 (模擬 /api/auth/me 回傳正確 Token)', async () => {
    // 模擬後端回傳：包含 authenticated: true 與 accessToken
    const mockResponse = {
      authenticated: true,
      accessToken: 'valid-customer-token-123',
      user: { name: 'Test User' }
    };

    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    // 執行 checkAuth
    await useAuthStore.getState().checkAuth();

    // 驗證狀態
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.customerAccessToken).toBe('valid-customer-token-123'); // 關鍵驗證點
    expect(state.user?.name).toBe('Member'); // 根據您的 store 邏輯，目前是寫死 'Member'
  });

  it('TC-03: checkAuth 失敗時 (401) 應重置狀態', async () => {
    // 模擬後端回傳 401
    globalFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.customerAccessToken).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('TC-04: checkAuth 回傳 authenticated: false 時應重置狀態', async () => {
    // 模擬後端回傳 200 但 authenticated 為 false
    globalFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: false }),
    });

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.customerAccessToken).toBeNull();
  });

  it('TC-05: Logout 應清除狀態並呼叫後端 API', async () => {
    // 先設定為登入狀態
    useAuthStore.setState({
      isAuthenticated: true,
      customerAccessToken: 'token-to-be-removed',
      isLoading: false
    });

    globalFetch.mockResolvedValue({ ok: true });

    await useAuthStore.getState().logout();

    // 驗證是否呼叫後端 logout endpoint
    expect(globalFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });

    // 驗證前端狀態是否清除
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.customerAccessToken).toBeNull();
    expect(state.user).toBeNull();
    
    // 驗證是否觸發 reload
    expect(mockLocation.reload).toHaveBeenCalled();
  });
});