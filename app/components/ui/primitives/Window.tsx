'use client';
import React, { HTMLAttributes } from 'react';
import styles from './Window.module.scss';
import { PixelIcon } from '@hackernoon/pixel-icon-library';

// =============================================================================
// TYPES
// =============================================================================

export interface WindowFrameProps extends HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
}

export interface WindowTitleBarProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  isActive?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  icon?: string;
}

export type WindowButtonVariant = 'close' | 'collapse' | 'fullscreen' | 'help';

export interface WindowButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant: WindowButtonVariant;
  disabled?: boolean;
}

export interface ResizeHandleProps extends HTMLAttributes<HTMLDivElement> { }


// =============================================================================
// WINDOW FRAME
// =============================================================================
// The main container for a window interface.
export const WindowFrame = React.forwardRef<HTMLDivElement, WindowFrameProps>(
  ({ children, className, isActive = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.windowFrame} ${isActive ? styles.active : ''} ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
WindowFrame.displayName = 'WindowFrame';


// =============================================================================
// WINDOW BUTTON
// =============================================================================
// Control buttons for the window (Close, Minimize, Maximize)
export const WindowButton = React.forwardRef<HTMLButtonElement, WindowButtonProps>(
  ({ variant, className, disabled, ...props }, ref) => {

    // Determine icon/content based on variant
    const renderContent = () => {
      switch (variant) {
        case 'close':
          return '✕'; // Heavy X is standard for these
        case 'collapse':
          return '_';
        case 'fullscreen':
          return '◻';
        case 'help':
          return '?';
        default:
          return null;
      }
    };

    const variantClass = {
      close: styles.buttonClose,
      collapse: styles.buttonCollapse,
      fullscreen: styles.buttonFullScreen,
      help: ''
    }[variant];

    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.windowButton} ${variantClass} ${className || ''}`}
        disabled={disabled}
        aria-label={variant}
        {...props}
      >
        {/* Content handled via background-image in CSS */}
      </button>
    );
  }
);
WindowButton.displayName = 'WindowButton';


// =============================================================================
// WINDOW TITLE BAR
// =============================================================================
// The drag handle and control area
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
        <div
          ref={ref}
          className={`${styles.titleBar} ${isActive ? '' : styles.inactive} ${className || ''}`}
          {...props}
        >
          {/* System 6 Standard: Close Box on LEFT */}
          {onClose && <WindowButton variant="close" onClick={onClose} />}

          {/* Center Title */}
          <span className={styles.titleText}>{title}</span>

          {/* Right Side: Other Controls */}
          <div className={styles.titleControls}>
            {children}

            {!children && (
              <>
                {onMinimize && <WindowButton variant="collapse" onClick={onMinimize} />}
                {onMaximize && <WindowButton variant="fullscreen" onClick={onMaximize} />}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);
WindowTitleBar.displayName = 'WindowTitleBar';


// =============================================================================
// RESIZE HANDLE
// =============================================================================
// Visual grip for resizing
export const ResizeHandle = React.forwardRef<HTMLDivElement, ResizeHandleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.resizeHandle} ${className || ''}`}
        {...props}
      />
    );
  }
);
ResizeHandle.displayName = 'ResizeHandle';
