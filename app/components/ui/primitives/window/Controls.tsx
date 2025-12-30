'use client';
import React, { HTMLAttributes } from 'react';
import styles from './Controls.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export type WindowButtonVariant = 'close' | 'collapse' | 'fullscreen' | 'help';

export interface WindowButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant: WindowButtonVariant;
  disabled?: boolean;
}

// =============================================================================
// WINDOW BUTTON
// =============================================================================
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
        {renderContent()}
      </button>
    );
  }
);
WindowButton.displayName = 'WindowButton';
