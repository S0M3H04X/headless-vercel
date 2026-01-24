'use client';
import React, { HTMLAttributes } from 'react';
import styles from './Frame.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export interface WindowFrameProps extends HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
}

export interface ResizeHandleProps extends HTMLAttributes<HTMLDivElement> { }

// =============================================================================
// WINDOW FRAME
// =============================================================================
export const WindowFrame = React.forwardRef<HTMLDivElement, WindowFrameProps>(
  ({ children, className, isActive = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.windowFrame} ${isActive ? styles.active : ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
WindowFrame.displayName = 'WindowFrame';

// =============================================================================
// RESIZE HANDLE
// =============================================================================
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
