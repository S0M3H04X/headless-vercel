'use client';
// app/components/ui/primitives/ScrollArea.tsx
import React, {
  createContext,
  useContext,
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type {
  ScrollAreaProps,
  ScrollAreaViewportProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
} from './types';
import styles from './ScrollArea.module.scss';

// =============================================================================
// CONTEXT
// =============================================================================

interface ScrollAreaContextValue {
  viewportRef: React.RefObject<HTMLDivElement>;
  scrollRatio: { x: number; y: number };
  thumbRatio: { x: number; y: number };
  onScrollByThumb: (orientation: 'vertical' | 'horizontal', delta: number) => void;
}

const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null);

const useScrollAreaContext = () => {
  const context = useContext(ScrollAreaContext);
  if (!context) {
    throw new Error('ScrollArea compound components must be used within ScrollArea');
  }
  return context;
};

// =============================================================================
// SCROLL AREA ROOT
// =============================================================================

interface ScrollAreaComponent extends React.ForwardRefExoticComponent<
  ScrollAreaProps & React.RefAttributes<HTMLDivElement>
> {
  Viewport: typeof Viewport;
  Scrollbar: typeof Scrollbar;
  Thumb: typeof Thumb;
}

const ScrollAreaRoot = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ orientation = 'vertical', hideScrollbar = false, className, children }, ref) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [scrollRatio, setScrollRatio] = useState({ x: 0, y: 0 });
    const [thumbRatio, setThumbRatio] = useState({ x: 1, y: 1 });

    const updateScrollState = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      } = viewport;

      // Calculate scroll position ratio (0 to 1)
      const maxScrollY = scrollHeight - clientHeight;
      const maxScrollX = scrollWidth - clientWidth;

      setScrollRatio({
        x: maxScrollX > 0 ? scrollLeft / maxScrollX : 0,
        y: maxScrollY > 0 ? scrollTop / maxScrollY : 0,
      });

      // Calculate thumb size ratio (viewport / content)
      setThumbRatio({
        x: scrollWidth > 0 ? Math.min(clientWidth / scrollWidth, 1) : 1,
        y: scrollHeight > 0 ? Math.min(clientHeight / scrollHeight, 1) : 1,
      });
    }, []);

    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      updateScrollState();

      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(viewport);

      viewport.addEventListener('scroll', updateScrollState);

      return () => {
        resizeObserver.disconnect();
        viewport.removeEventListener('scroll', updateScrollState);
      };
    }, [updateScrollState]);

    const onScrollByThumb = useCallback(
      (orientation: 'vertical' | 'horizontal', delta: number) => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        if (orientation === 'vertical') {
          const maxScrollY = viewport.scrollHeight - viewport.clientHeight;
          viewport.scrollTop = Math.max(0, Math.min(maxScrollY, viewport.scrollTop + delta));
        } else {
          const maxScrollX = viewport.scrollWidth - viewport.clientWidth;
          viewport.scrollLeft = Math.max(0, Math.min(maxScrollX, viewport.scrollLeft + delta));
        }
      },
      []
    );

    const classNames = [
      styles.scrollArea,
      styles[`orientation-${orientation}`],
      hideScrollbar && styles.hideScrollbar,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <ScrollAreaContext.Provider
        value={{ viewportRef: viewportRef as React.RefObject<HTMLDivElement>, scrollRatio, thumbRatio, onScrollByThumb }}
      >
        <div ref={ref} className={classNames}>
          {children}
        </div>
      </ScrollAreaContext.Provider>
    );
  }
);

ScrollAreaRoot.displayName = 'ScrollArea';

// =============================================================================
// VIEWPORT
// =============================================================================

const Viewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  ({ className, children }, _ref) => {
    const { viewportRef } = useScrollAreaContext();

    return (
      <div
        ref={viewportRef}
        className={`${styles.viewport} ${className || ''}`}
      >
        {children}
      </div>
    );
  }
);

Viewport.displayName = 'ScrollArea.Viewport';

// =============================================================================
// SCROLLBAR
// =============================================================================

const Scrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  ({ orientation = 'vertical', className, children }, ref) => {
    const { thumbRatio } = useScrollAreaContext();

    // Hide scrollbar if content fits
    const isVisible = orientation === 'vertical'
      ? thumbRatio.y < 1
      : thumbRatio.x < 1;

    if (!isVisible) return null;

    const classNames = [
      styles.scrollbar,
      styles[`scrollbar-${orientation}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames}>
        {children}
      </div>
    );
  }
);

Scrollbar.displayName = 'ScrollArea.Scrollbar';

// =============================================================================
// THUMB
// =============================================================================

const Thumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps & { orientation?: 'vertical' | 'horizontal' }>(
  ({ orientation = 'vertical', className }, ref) => {
    const { scrollRatio, thumbRatio, onScrollByThumb } = useScrollAreaContext();
    const thumbRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ y: 0, x: 0 });

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      },
      []
    );

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        const track = thumbRef.current?.parentElement;
        if (!track) return;

        const trackRect = track.getBoundingClientRect();

        if (orientation === 'vertical') {
          const deltaY = e.clientY - dragStartRef.current.y;
          const trackHeight = trackRect.height;
          const scrollDelta = (deltaY / trackHeight) * (trackHeight / thumbRatio.y);
          onScrollByThumb('vertical', scrollDelta);
          dragStartRef.current.y = e.clientY;
        } else {
          const deltaX = e.clientX - dragStartRef.current.x;
          const trackWidth = trackRect.width;
          const scrollDelta = (deltaX / trackWidth) * (trackWidth / thumbRatio.x);
          onScrollByThumb('horizontal', scrollDelta);
          dragStartRef.current.x = e.clientX;
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, orientation, thumbRatio, onScrollByThumb]);

    // Calculate thumb style
    const thumbStyle: React.CSSProperties = orientation === 'vertical'
      ? {
        height: `${thumbRatio.y * 100}%`,
        minHeight: '20px',
        top: `${scrollRatio.y * (100 - thumbRatio.y * 100)}%`,
      }
      : {
        width: `${thumbRatio.x * 100}%`,
        minWidth: '20px',
        left: `${scrollRatio.x * (100 - thumbRatio.x * 100)}%`,
      };

    const classNames = [
      styles.thumb,
      isDragging && styles.dragging,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={(node) => {
          (thumbRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={classNames}
        style={thumbStyle}
        onMouseDown={handleMouseDown}
      />
    );
  }
);

Thumb.displayName = 'ScrollArea.Thumb';

// =============================================================================
// COMPOUND COMPONENT ASSEMBLY
// =============================================================================

export const ScrollArea = ScrollAreaRoot as ScrollAreaComponent;
ScrollArea.Viewport = Viewport;
ScrollArea.Scrollbar = Scrollbar;
ScrollArea.Thumb = Thumb;
