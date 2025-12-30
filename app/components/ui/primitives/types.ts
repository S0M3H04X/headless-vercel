// app/components/ui/primitives/types.ts
import React from 'react';

// =============================================================================
// BASE PRIMITIVE PROPS
// =============================================================================

export interface PrimitiveProps {
  className?: string;
  children?: React.ReactNode;
}

// =============================================================================
// BUTTON TYPES
// =============================================================================

/** Logical button variants (determines behavior/appearance semantic) */
export type ButtonVariant = 'default' | 'help' | 'disclosure';

/** Visual button styles (determines where button is used) */
export type ButtonStyle = 'system' | 'tool' | 'menu' | 'custom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Logical variant: default (action), help (?), disclosure (▾) */
  variant?: ButtonVariant;
  /** Visual style: system (dialogs), tool (icon-only), menu, custom (widget) */
  buttonStyle?: ButtonStyle;
  /** If true, renders as default/primary button with pulsing border */
  isDefault?: boolean;
}

// =============================================================================
// SCROLL AREA TYPES
// =============================================================================

export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';

export interface ScrollAreaProps extends PrimitiveProps {
  orientation?: ScrollOrientation;
  hideScrollbar?: boolean;
}

export interface ScrollAreaViewportProps extends PrimitiveProps { }

export interface ScrollAreaScrollbarProps extends PrimitiveProps {
  orientation?: 'vertical' | 'horizontal';
}

export interface ScrollAreaThumbProps extends PrimitiveProps { }

// =============================================================================
// FORM TYPES
// =============================================================================

export interface GroupFrameProps extends PrimitiveProps {
  /** Legend text displayed at the top of the frame */
  legend?: string;
}

export interface RadioProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  name: string;
  value: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// =============================================================================
// TABS TYPES
// =============================================================================

export interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export interface TabsProps extends PrimitiveProps {
  /** Default active tab value */
  defaultValue?: string;
  /** Controlled active tab value */
  value?: string;
  /** Callback when active tab changes */
  onValueChange?: (value: string) => void;
}

export interface TabsListProps extends PrimitiveProps { }

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Unique value identifying this tab */
  value: string;
  children?: React.ReactNode;
}

export interface TabsPanelProps extends PrimitiveProps {
  /** Value matching a TabsTrigger to show this panel */
  value: string;
}
