import { useAuthStore } from '@/store/authStore';

type RequestOptions = RequestInit & {
  skipRetry?: boolean; // 防止無窮迴圈的保險開關
};

/**
 * 通用 API 客戶端
 * 自動處理 Shopify API 的 401 錯誤與 Token 刷新
 */
export async function apiClient<T = any>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { skipRetry, ...fetchOptions } = options;

  // 1. 執行原始請求
  let response = await fetch(endpoint, fetchOptions);

  // 2. 攔截 401 Unauthorized (Token 可能過期)
  if (response.status === 401 && !skipRetry) {
    console.warn('[API Client] 401 detected, attempting to refresh token...');

    try {
      // 3. 呼叫 Auth Store 的 checkAuth 來觸發後端刷新邏輯
      // 注意：checkAuth 會呼叫 /api/auth/me，該路由已實作 Silent Refresh
      const authStore = useAuthStore.getState();
      await authStore.checkAuth();
      
      // 取得最新狀態
      const { isAuthenticated } = useAuthStore.getState();

      if (isAuthenticated) {
        console.log('[API Client] Token refreshed, retrying original request...');
        // 4. 刷新成功，重試原請求 (標記 skipRetry 以防死結)
        response = await fetch(endpoint, { ...fetchOptions });
      } else {
        console.error('[API Client] Refresh failed, session expired.');
        // 刷新失敗，執行登出清理
        await authStore.logout();
        throw new Error('Session expired'); // 中斷執行
      }
    } catch (error) {
      console.error('[API Client] Error during refresh flow:', error);
      throw error;
    }
  }

  // 5. 處理其他 HTTP 錯誤
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  // 6. 回傳數據
  // 如果 Response 是空的 (如 204 No Content)，回傳 null
  if (response.status === 204) {
      return null as T;
  }

  return response.json();
}