// Accessible modal dialog (Esc / backdrop close, focus management, scroll lock).

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useRef(`modal-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-card modal-card--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
      >
        <div className="modal-head">
          <h3 id={titleId.current}>{title}</h3>
          <ButtonClose ref={closeRef} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

const ButtonClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function ButtonClose(
  props,
  ref,
) {
  return (
    <button ref={ref} className="btn btn--ghost btn--sm" aria-label="Close dialog" {...props}>
      <X size={14} />
    </button>
  );
});
