// app/components/system/dialog/types.ts
import React from 'react';

// =============================================================================
// DIALOG TYPES
// =============================================================================

/** Standard system dialog icon types matching classic OS dialogs */
export type DialogIconType = 'stop' | 'note' | 'caution';

export interface SystemDialogProps {
  /** Whether dialog is visible */
  open: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Dialog icon type for visual variant */
  type?: DialogIconType;
  /** Dialog content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Whether clicking backdrop closes dialog, default: false */
  closeOnBackdropClick?: boolean;
}

export interface DialogIconProps {
  /** Icon variant */
  type: DialogIconType;
  /** Additional className */
  className?: string;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogMessageProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogActionsProps {
  children: React.ReactNode;
  className?: string;
}

// =============================================================================
// DIALOG HELPER TYPES
// =============================================================================

export interface AlertOptions {
  title: string;
  message: string;
  icon?: DialogIconType;
  buttonLabel?: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  icon?: DialogIconType;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface PromptOptions {
  title: string;
  message: string;
  icon?: DialogIconType;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}
