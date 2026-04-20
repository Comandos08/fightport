import { useRef, useState } from 'react';

type Direction = 'left' | 'right';

type Options = {
  /** Pixels para arrastar antes de disparar onClose. Default 70. */
  threshold?: number;
  /** Direção do gesto que fecha. Default 'left' (arrasta para esquerda). */
  direction?: Direction;
  /** Callback disparado quando o swipe ultrapassa o threshold. */
  onClose: () => void;
};

/**
 * Hook para implementar swipe-to-close em drawers laterais.
 *
 * Uso:
 * ```tsx
 * const { dragOffset, touchHandlers } = useSwipeToClose({ onClose: () => setOpen(false) });
 *
 * <aside
 *   style={{
 *     transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
 *     transition: dragOffset === 0 ? 'transform 200ms ease-out' : 'none',
 *     touchAction: 'pan-y',
 *   }}
 *   {...touchHandlers}
 * />
 * ```
 *
 * - Distingue gesto horizontal de scroll vertical nos primeiros 8px.
 * - Apenas o eixo da direção configurada move o drawer; o eixo oposto é ignorado.
 */
export function useSwipeToClose({
  threshold = 70,
  direction = 'left',
  onClose,
}: Options) {
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!isHorizontalSwipe.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontalSwipe.current) return;

    if (direction === 'left' && dx < 0) setDragOffset(dx);
    if (direction === 'right' && dx > 0) setDragOffset(dx);
  };

  const handleTouchEnd = () => {
    const passed =
      direction === 'left' ? dragOffset < -threshold : dragOffset > threshold;
    if (isHorizontalSwipe.current && passed) {
      onClose();
    }
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = false;
  };

  return {
    dragOffset,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
  };
}
