// app/components/system/dialog/SystemDialog.tsx
'use client';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  SystemDialogProps,
  DialogIconProps,
  DialogTitleProps,
  DialogMessageProps,
  DialogActionsProps,
} from './types';
import styles from './SystemDialog.module.scss';
// import '@hackernoon/pixel-icon-library/fonts/iconfont.css';

// =============================================================================
// DIALOG ICON
// =============================================================================

const DialogIcon: React.FC<DialogIconProps> = ({ type, className }) => {
  // Map dialog types to pixel-icon-library icon names
  const iconNames: Record<DialogIconProps['type'], string> = {
    stop: 'exclamation-circle',
    note: 'info-circle',
    caution: 'exclamation-triangle',
  };

  return (
    <div className={`${styles.dialogIcon} ${styles[type]} ${className || ''}`}>
      <i className={`hn hn-${iconNames[type]}`} style={{ fontSize: 24 }} />
    </div>
  );
};

DialogIcon.displayName = 'SystemDialog.Icon';

// =============================================================================
// DIALOG TITLE
// =============================================================================

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return (
    <h2 className={`${styles.dialogTitle} ${className || ''}`}>
      {children}
    </h2>
  );
};

DialogTitle.displayName = 'SystemDialog.Title';

// =============================================================================
// DIALOG MESSAGE
// =============================================================================

const DialogMessage: React.FC<DialogMessageProps> = ({ children, className }) => {
  return (
    <p className={`${styles.dialogMessage} ${className || ''}`}>
      {children}
    </p>
  );
};

DialogMessage.displayName = 'SystemDialog.Message';

// =============================================================================
// DIALOG ACTIONS
// =============================================================================

const DialogActions: React.FC<DialogActionsProps> = ({ children, className }) => {
  return (
    <div className={`${styles.dialogActions} ${className || ''}`}>
      {children}
    </div>
  );
};

DialogActions.displayName = 'SystemDialog.Actions';

// =============================================================================
// SYSTEM DIALOG (ROOT)
// =============================================================================

interface SystemDialogComponent extends React.FC<SystemDialogProps> {
  Icon: typeof DialogIcon;
  Title: typeof DialogTitle;
  Message: typeof DialogMessage;
  Actions: typeof DialogActions;
}

const SystemDialogRoot: React.FC<SystemDialogProps> = ({
  open,
  onClose,
  type = 'note',
  children,
  className,
  closeOnBackdropClick = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.dialogOverlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className={`${styles.dialogFrame} ${className || ''}`}
      >
        <div className={styles.dialogHeader}>
          {/* Children should include Icon and Title */}
        </div>
        {children}
      </div>
    </div>
  );
};

// Attach subcomponents
export const SystemDialog = SystemDialogRoot as SystemDialogComponent;
SystemDialog.Icon = DialogIcon;
SystemDialog.Title = DialogTitle;
SystemDialog.Message = DialogMessage;
SystemDialog.Actions = DialogActions;

// Named exports
export { DialogIcon, DialogTitle, DialogMessage, DialogActions };
