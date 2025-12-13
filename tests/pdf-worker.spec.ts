// tests/pdf-worker.spec.ts
import { test, expect } from '@playwright/test';

test.describe('TC-001: Worker Script Accessibility', () => {
  
  test('應成功載入 pdf.worker.min.js 且狀態碼為 200', async ({ page }) => {
    // 1. 監聽網路請求 (Network Interception)
    // 我們要抓取包含 "pdf.worker" 的請求，不論它是來自 unpkg 還是本地
    const workerRequestPromise = page.waitForResponse(response => 
      response.url().includes('pdf.worker') && 
      response.status() === 200
    );

    // 2. 前往首頁 (假設您的開發伺服器跑在 localhost:3000)
    await page.goto('http://localhost:3000');

    // 3. 觸發：點擊 "Open PDF" 按鈕
    // 根據我們之前的 Desktop.tsx，按鈕文字是 "Open PDF"
    await page.getByRole('button', { name: 'Open PDF' }).click();

    // 4. 驗證：等待 Worker 請求成功返回
    // 如果 5秒內沒收到 200 回應，測試就會失敗
    const response = await workerRequestPromise;
    
    console.log(`[TC-001] Worker loaded from: ${response.url()}`);
    expect(response.ok()).toBeTruthy();
  });

  test('不應出現 Worker 載入錯誤或 CORS 錯誤', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // 監聽 Console Error
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: 'Open PDF' }).click();

    // 等待一點時間讓錯誤有機會出現
    await page.waitForTimeout(2000);

    // 過濾出關鍵字錯誤
    const criticalErrors = consoleErrors.filter(err => 
      err.includes('Setting up fake worker failed') || 
      err.includes('undefined is not a non-null object') ||
      err.includes('CORS')
    );

    if (criticalErrors.length > 0) {
      console.error('[TC-001] Found critical errors:', criticalErrors);
    }

    expect(criticalErrors).toHaveLength(0);
  });

});