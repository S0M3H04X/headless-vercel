'use client';
import React, { HTMLAttributes } from 'react';
import styles from './TitleBar.module.scss';
import { WindowButton } from './Controls';

// =============================================================================
// TYPES
// =============================================================================

export interface WindowTitleBarProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  isActive?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  icon?: string;
}

// =============================================================================
// WINDOW TITLE BAR
// =============================================================================
export const WindowTitleBar = React.forwardRef<HTMLDivElement, WindowTitleBarProps>(
  ({
    title = 'Untitled',
    isActive = true,
    className,
    children,
    onClose,
    onMinimize,
    onMaximize,
    icon,
    ...props
  }, ref) => {

    return (
      <div
        ref={ref}
        className={`${styles.titleBar} ${isActive ? '' : styles.inactive} ${className || ''}`}
        {...props}
      >
        {/* Left Side: Icon + Title */}
        <div className="flex items-center flex-1 overflow-hidden">
          {icon && (
            <div className="w-4 h-4 mr-1 flex items-center justify-center">
              <img src={icon} alt="" className="w-full h-full object-contain" />
            </div>
          )}
          <span className={styles.titleText}>{title}</span>
        </div>

        {/* Right Side: Controls */}
        <div
          className={styles.titleControls}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {children}

          {/* Auto-generated buttons if handlers provided */}
          {!children && (
            <>
              {onMinimize && <WindowButton variant="collapse" onClick={onMinimize} />}
              {onMaximize && <WindowButton variant="fullscreen" onClick={onMaximize} />}
              {onClose && <WindowButton variant="close" onClick={onClose} />}
            </>
          )}
        </div>
      </div>
    );
  }
);
WindowTitleBar.displayName = 'WindowTitleBar';
