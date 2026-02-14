'use client';
import React, { HTMLAttributes, useEffect, useLayoutEffect, useRef, useState } from 'react';
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








          <TitleText>{title}</TitleText>
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
const TitleText = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isMarquee, setIsMarquee] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (container && text) {
      setIsMarquee(text.offsetWidth > container.offsetWidth);
    }
  }, [children]);

  return (
    <div className={styles.titleContainer} ref={containerRef}>
      <div className={`${styles.titleTextWrapper} ${isMarquee ? styles.marquee : ''}`}>
        <span ref={textRef} className={styles.titleText}>
          {children}
        </span>
        {isMarquee && (
          <span className={styles.titleText} aria-hidden="true">
            {children}
          </span>
        )}
      </div>
    </div>
  );
};

WindowTitleBar.displayName = 'WindowTitleBar';
