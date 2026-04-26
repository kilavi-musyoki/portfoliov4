import { useEffect } from 'react';

/**
 * Focus trap for modal/navigation drawers.
 * Keeps keyboard Tab navigation contained within the referenced container.
 * @param {React.RefObject<HTMLElement>} containerRef - Ref to the drawer element.
 * @param {boolean} active - Whether the trap should be active.
 */
export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const focusable = containerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) return;
    // Focus the first element when opening
    first.focus();
    const handleKey = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [containerRef, active]);
}
