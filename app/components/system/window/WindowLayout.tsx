// app/components/system/window/WindowLayout.tsx
'use client';
import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  WindowLayoutProps,
  WindowToolbarProps,
  WindowSidebarProps,
  WindowContentProps,
  WindowStatusBarProps,
  WindowLayoutContextValue,
} from './types';
import styles from './WindowLayout.module.scss';

// =============================================================================
// CONTEXT
// =============================================================================

const WindowLayoutContext = createContext<WindowLayoutContextValue | null>(null);

const useWindowLayoutContext = () => {
  const context = useContext(WindowLayoutContext);
  if (!context) {
    throw new Error('WindowLayout components must be used within a WindowLayout');
  }
  return context;
};

// =============================================================================
// WINDOW TOOLBAR
// =============================================================================

const WindowToolbar: React.FC<WindowToolbarProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`${styles.windowToolbar} ${className || ''}`}>
      {children}
    </div>
  );
};

WindowToolbar.displayName = 'WindowLayout.Toolbar';

// =============================================================================
// WINDOW SIDEBAR
// =============================================================================

const WindowSidebar: React.FC<WindowSidebarProps> = ({
  children,
  className,
  width = 180,
  collapsible = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const context = useWindowLayoutContext();
  const isCollapsed = controlledCollapsed ?? context.sidebarCollapsed;

  return (
    <div
      className={`${styles.windowSidebar} ${isCollapsed ? styles.collapsed : ''} ${className || ''}`}
      style={{ width: isCollapsed ? 0 : width }}
    >
      <div className={styles.sidebarContent}>
        {children}
      </div>
    </div>
  );
};

WindowSidebar.displayName = 'WindowLayout.Sidebar';

// =============================================================================
// WINDOW CONTENT
// =============================================================================

const WindowContent: React.FC<WindowContentProps> = ({
  children,
  className,
  scrollable = true,
  padding = 'none',
}) => {
  const paddingClass = {
    none: styles.paddingNone,
    small: styles.paddingSmall,
    medium: styles.paddingMedium,
    large: styles.paddingLarge,
  }[padding];

  return (
    <div
      className={`${styles.windowContent} ${paddingClass} ${className || ''}`}
      style={{ overflow: scrollable ? 'auto' : 'hidden' }}
    >
      {children}
    </div>
  );
};

WindowContent.displayName = 'WindowLayout.Content';

// =============================================================================
// WINDOW STATUS BAR
// =============================================================================

const WindowStatusBar: React.FC<WindowStatusBarProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`${styles.windowStatusBar} ${className || ''}`}>
      {children}
    </div>
  );
};

WindowStatusBar.displayName = 'WindowLayout.StatusBar';

// =============================================================================
// WINDOW LAYOUT (ROOT)
// =============================================================================

interface WindowLayoutComponent extends React.FC<WindowLayoutProps> {
  Toolbar: typeof WindowToolbar;
  Sidebar: typeof WindowSidebar;
  Content: typeof WindowContent;
  StatusBar: typeof WindowStatusBar;
}

const WindowLayoutRoot: React.FC<WindowLayoutProps> = ({
  children,
  className,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Analyze children to determine layout structure
  const childArray = React.Children.toArray(children);
  const hasSidebar = childArray.some(
    (child) => React.isValidElement(child) && child.type === WindowSidebar
  );
  const hasToolbar = childArray.some(
    (child) => React.isValidElement(child) && child.type === WindowToolbar
  );
  const hasStatusBar = childArray.some(
    (child) => React.isValidElement(child) && child.type === WindowStatusBar
  );

  const contextValue = useMemo<WindowLayoutContextValue>(() => ({
    hasSidebar,
    hasToolbar,
    hasStatusBar,
    sidebarCollapsed,
    setSidebarCollapsed,
  }), [hasSidebar, hasToolbar, hasStatusBar, sidebarCollapsed]);

  // Build dynamic class names based on layout structure
  const layoutClasses = [
    styles.windowLayout,
    !hasSidebar && styles.noSidebar,
    !hasToolbar && styles.noToolbar,
    !hasStatusBar && styles.noStatusBar,
    className,
  ].filter(Boolean).join(' ');

  return (
    <WindowLayoutContext.Provider value={contextValue}>
      <div className={layoutClasses}>
        {children}
      </div>
    </WindowLayoutContext.Provider>
  );
};

// Attach subcomponents
export const WindowLayout = WindowLayoutRoot as WindowLayoutComponent;
WindowLayout.Toolbar = WindowToolbar;
WindowLayout.Sidebar = WindowSidebar;
WindowLayout.Content = WindowContent;
WindowLayout.StatusBar = WindowStatusBar;

// Named exports for convenience
export { WindowToolbar, WindowSidebar, WindowContent, WindowStatusBar };
