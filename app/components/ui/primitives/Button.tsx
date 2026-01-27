'use client';
// app/components/ui/primitives/Button.tsx
import React, { forwardRef } from 'react';
import type { ButtonProps } from './types';
import styles from './Button.module.scss';

/**
 * Primitive Button Component
 * 
 * Separates logical behavior (variant) from visual style (buttonStyle)
 * 
 * @example
 * // System dialog button (OK, Cancel)
 * <Button buttonStyle="system" isDefault>OK</Button>
 * 
 * // Help button with question mark
 * <Button variant="help" buttonStyle="system" />
 * 
 * // Toolbar icon button
 * <Button variant="default" buttonStyle="tool">🔧</Button>
 * 
 * // Menu item
 * <Button variant="default" buttonStyle="menu">File</Button>
 * 
 * // Custom widget button
 * <Button buttonStyle="custom">Add to Cart</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      buttonStyle = 'system',
      isDefault = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[`variant-${variant}`],
      styles[`style-${buttonStyle}`],
      isDefault && styles.isDefault,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // For help variant, render a question mark if no children provided
    const content = variant === 'help' && !children ? '?' : children;

    // For disclosure variant, render a triangle if no children provided
    const disclosureContent =
      variant === 'disclosure' && !children ? '▾' : content;

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled}
        {...props}
      >
        <span className={styles.backdrop} />
        <span className={styles.content}>

        {disclosureContent}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
