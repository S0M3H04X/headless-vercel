// app/components/system/dialog/dialogs.tsx
'use client';
import React, { useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SystemDialog } from './SystemDialog';
import { Button } from '@/components/ui/primitives';
import { AlertOptions, ConfirmOptions, PromptOptions, DialogIconType } from './types';
import styles from './SystemDialog.module.scss';

// =============================================================================
// HELPER: Render dialog in portal
// =============================================================================

function renderDialog(
  renderContent: (onClose: (result?: unknown) => void) => React.ReactNode
): Promise<unknown> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.id = 'system-dialog-root';
    document.body.appendChild(container);

    const root = createRoot(container);

    const handleClose = (result?: unknown) => {
      root.unmount();
      document.body.removeChild(container);
      resolve(result);
    };

    root.render(<>{renderContent(handleClose)}</>);
  });
}

// =============================================================================
// ALERT DIALOG COMPONENT
// =============================================================================

interface AlertDialogProps extends AlertOptions {
  onClose: () => void;
}

const AlertDialogContent: React.FC<AlertDialogProps> = ({
  title,
  message,
  icon = 'note',
  buttonLabel = 'OK',
  onClose,
}) => {
  const [open, setOpen] = useState(true);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(onClose, 150); // Wait for animation
  }, [onClose]);

  return (
    <SystemDialog open={open} onClose={handleClose} type={icon}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type={icon} />
        <SystemDialog.Title>{title}</SystemDialog.Title>
      </div>
      <SystemDialog.Message>{message}</SystemDialog.Message>
      <SystemDialog.Actions>
        <Button isDefault onClick={handleClose}>
          {buttonLabel}
        </Button>
      </SystemDialog.Actions>
    </SystemDialog>
  );
};

// =============================================================================
// CONFIRM DIALOG COMPONENT
// =============================================================================

interface ConfirmDialogProps extends ConfirmOptions {
  onClose: (result: boolean) => void;
}

const ConfirmDialogContent: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  icon = 'caution',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onClose,
}) => {
  const [open, setOpen] = useState(true);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    setTimeout(() => onClose(true), 150);
  }, [onClose]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setTimeout(() => onClose(false), 150);
  }, [onClose]);

  return (
    <SystemDialog open={open} onClose={handleCancel} type={icon}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type={icon} />
        <SystemDialog.Title>{title}</SystemDialog.Title>
      </div>
      <SystemDialog.Message>{message}</SystemDialog.Message>
      <SystemDialog.Actions>
        <Button onClick={handleCancel}>{cancelLabel}</Button>
        <Button isDefault onClick={handleConfirm}>{confirmLabel}</Button>
      </SystemDialog.Actions>
    </SystemDialog>
  );
};

// =============================================================================
// PROMPT DIALOG COMPONENT
// =============================================================================

interface PromptDialogProps extends PromptOptions {
  onClose: (result: string | null) => void;
}

const PromptDialogContent: React.FC<PromptDialogProps> = ({
  title,
  message,
  icon = 'note',
  defaultValue = '',
  placeholder = '',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onClose,
}) => {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    setTimeout(() => onClose(value), 150);
  }, [onClose, value]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setTimeout(() => onClose(null), 150);
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  }, [handleConfirm]);

  return (
    <SystemDialog open={open} onClose={handleCancel} type={icon}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type={icon} />
        <SystemDialog.Title>{title}</SystemDialog.Title>
      </div>
      <SystemDialog.Message>{message}</SystemDialog.Message>
      <input
        ref={inputRef}
        type="text"
        className={styles.dialogInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus
      />
      <SystemDialog.Actions>
        <Button onClick={handleCancel}>{cancelLabel}</Button>
        <Button isDefault onClick={handleConfirm}>{confirmLabel}</Button>
      </SystemDialog.Actions>
    </SystemDialog>
  );
};

// =============================================================================
// EXPORTED HELPER FUNCTIONS
// =============================================================================

/**
 * Show an alert dialog with a single OK button.
 * @returns Promise that resolves when dialog is dismissed
 */
export function alert(options: AlertOptions): Promise<void> {
  return renderDialog((onClose) => (
    <AlertDialogContent {...options} onClose={() => onClose()} />
  )) as Promise<void>;
}

/**
 * Show a confirm dialog with OK/Cancel buttons.
 * @returns Promise<boolean> - true if confirmed, false if cancelled
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return renderDialog((onClose) => (
    <ConfirmDialogContent {...options} onClose={(result) => onClose(result)} />
  )) as Promise<boolean>;
}

/**
 * Show a prompt dialog with text input.
 * @returns Promise<string | null> - input value if confirmed, null if cancelled
 */
export function prompt(options: PromptOptions): Promise<string | null> {
  return renderDialog((onClose) => (
    <PromptDialogContent {...options} onClose={(result) => onClose(result)} />
  )) as Promise<string | null>;
}
