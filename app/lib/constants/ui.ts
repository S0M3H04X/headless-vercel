// app/lib/constants/ui.ts

export const Z_INDEX = {
  DESKTOP: 0,
  ICONS: 10,
  // 視窗基礎層級，WinBox 會在此之上疊加
  WINDOWS_BASE: 100,
  // 系統列必須高於所有普通視窗
  DOCK: 99,
  MENU_BAR: 9999,
  // 模態視窗與通知
  MODAL: 10000,
  TOAST: 11000,
} as const;

export const LAYOUT = {
  // Menu Bar 固定高度，用於計算桌面安全區域
  MENU_BAR_HEIGHT: 32,
} as const;