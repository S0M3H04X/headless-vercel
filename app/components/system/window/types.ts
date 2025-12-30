// app/components/system/window/types.ts
import React from 'react';

// =============================================================================
// WINDOW LAYOUT TYPES
// =============================================================================

export interface WindowLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface WindowToolbarProps {
  children?: React.ReactNode;
  className?: string;
}

export interface WindowSidebarProps {
  children?: React.ReactNode;
  className?: string;
  /** Initial width in pixels, default: 180 */
  width?: number;
  /** Whether sidebar can be collapsed */
  collapsible?: boolean;
  /** Controlled collapse state */
  collapsed?: boolean;
  /** Called when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export interface WindowContentProps {
  children?: React.ReactNode;
  className?: string;
  /** Whether to show scrollbars, default: true (auto overflow) */
  scrollable?: boolean;
  /** Padding preset: 'none' | 'small' | 'medium' | 'large' */
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export interface WindowStatusBarProps {
  children?: React.ReactNode;
  className?: string;
}

// =============================================================================
// WINDOW LAYOUT CONTEXT
// =============================================================================

export interface WindowLayoutContextValue {
  hasSidebar: boolean;
  hasToolbar: boolean;
  hasStatusBar: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}
