import { useRef, useCallback } from 'react';

interface UseIconInteractionProps {
  onOpen: () => void;
  onSelect?: () => void;
}

export const useIconInteraction = ({ onOpen, onSelect }: UseIconInteractionProps) => {
  const touchStartTime = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartTime.current = Date.now();
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return;

    const touchDuration = Date.now() - touchStartTime.current;
    const touchEndPos = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const distance = Math.sqrt(
      Math.pow(touchEndPos.x - touchStartPos.current.x, 2) +
      Math.pow(touchEndPos.y - touchStartPos.current.y, 2)
    );

    // Reset touch start info
    touchStartPos.current = null;

    // Define tap thresholds: < 300ms duration, < 10px movement
    if (touchDuration < 300 && distance < 10) {
      // It's a tap!
      e.preventDefault(); // Prevent mouse emulation (click/dblclick)
      onOpen();
    }
  }, [onOpen]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    onOpen();
  }, [onOpen]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (onSelect) {
      onSelect();
    }
  }, [onSelect]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onDoubleClick: handleDoubleClick,
    onClick: handleClick,
  };
};
