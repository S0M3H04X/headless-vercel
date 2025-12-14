// 定義事件型別
export type AnalyticsEventType = 'window_open' | 'window_close' | 'error' | 'performance';

interface AnalyticsPayload {
  [key: string]: any;
}

export const AnalyticsService = {
  /**
   * 發送分析數據到 Python Backend
   * 使用 sendBeacon 以確保 "射後不理" (Fire-and-forget)，即使頁面卸載也能發送
   */
  track: (eventType: AnalyticsEventType, payload: AnalyticsPayload) => {
    // 1. 準備數據
    const data = {
      event_type: eventType,
      payload: payload,
      timestamp: Date.now(),
      session_id: 'sess_' + Math.random().toString(36).substr(2, 9), // 簡化版 Session ID
    };

    // 2. 建構 URL
    // 注意：在 Vercel 環境下，相對路徑會自動被導向正確的 Domain
    const url = '/api/python/analytics/collect';

    // 3. 發送數據
    // sendBeacon 預設發送 POST，但在某些瀏覽器中 Content-Type 限制較多
    // 使用 Blob 封裝以確保 JSON 格式正確
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });

    const success = navigator.sendBeacon(url, blob);

    if (!success) {
      // Fallback: 如果 sendBeacon 失敗 (例如數據量過大)，嘗試使用 fetch
      console.warn('[Analytics] Beacon failed, falling back to fetch');
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true, // 重要：允許請求在頁面關閉後存活
      }).catch((e) => console.error('[Analytics] Fetch failed:', e));
    } else {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Sent: ${eventType}`, payload);
        }
    }
  },
};