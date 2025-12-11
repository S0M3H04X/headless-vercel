import { useMemo } from 'react';
import { z } from 'zod';

/**
 * @param rawState 來自 WindowInstance 的不透明狀態 (可能為 null, undefined 或 髒數據)
 * @param schema Zod Schema，定義該 Widget 預期的狀態結構
 * @param defaultState 若驗證失敗或無狀態時的預設值
 */
export function useWidgetState<T>(
  rawState: unknown, 
  schema: z.ZodSchema<T>, 
  defaultState: T
): T {
  const safeState = useMemo(() => {
    // 1. 如果完全沒狀態，回傳預設值
    if (rawState === undefined || rawState === null) {
      return defaultState;
    }

    // 2. 嘗試驗證
    const result = schema.safeParse(rawState);
    
    if (result.success) {
      return result.data;
    } else {
      console.warn('[WidgetState] Invalid state detected, resetting to default:', result.error);
      return defaultState;
    }
  }, [rawState, schema, defaultState]);

  return safeState;
}