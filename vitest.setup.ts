import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// [模型綁定] 顯式將 DOM Matchers 擴充至 Vitest 的斷言庫中
// 解決 "Invalid Chai property" 的核心步驟
expect.extend(matchers);

// [生命週期管理] 確保每個測試案例後的環境清理，避免狀態汙染
afterEach(() => {
  cleanup();
});