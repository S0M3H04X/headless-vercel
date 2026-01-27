'use client';
// app/components/ui/primitives/Forms.tsx
import React, { forwardRef, useId, useState, useRef, useEffect } from 'react';
import type {
  GroupFrameProps,
  RadioProps,
  CheckboxProps,
  SelectProps,
  SelectOption,
} from './types';
import styles from './Forms.module.scss';

// =============================================================================
// GROUP FRAME (Fieldset equivalent)
// =============================================================================

export const GroupFrame = forwardRef<HTMLFieldSetElement, GroupFrameProps>(
  ({ legend, className, children }, ref) => {
    return (
      <fieldset
        ref={ref}
        className={`${styles.groupFrame} ${className || ''}`}
      >
        {legend && <legend className={styles.legend}>{legend}</legend>}
        <div className={styles.groupContent}>{children}</div>
      </fieldset>
    );
  }
);

GroupFrame.displayName = 'GroupFrame';

// =============================================================================
// RADIO BUTTON
// =============================================================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked,
      defaultChecked,
      onChange,
      name,
      value,
      label,
      disabled = false,
      className,
    },
    ref
  ) => {
    const id = useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <label
        htmlFor={id}
        className={`${styles.radioLabel} ${disabled ? styles.disabled : ''} ${className || ''}`}
      >
        <span className={styles.radioWrapper}>
          <input
            ref={ref}
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={handleChange}
            disabled={disabled}
            className={styles.radioInput}
          />
          <span className={styles.radioControl}>
            <span className={styles.radioDot} />
          </span>
        </span>
        {label && <span className={styles.radioText}>{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

// =============================================================================
// CHECKBOX
// =============================================================================

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      indeterminate = false,
      onChange,
      label,
      disabled = false,
      className,
    },
    ref
  ) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle indeterminate state (not available via HTML attribute)
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    // Merge refs
    const setRefs = (node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <label
        htmlFor={id}
        className={`${styles.checkboxLabel} ${disabled ? styles.disabled : ''} ${className || ''}`}
      >
        <span className={styles.checkboxWrapper}>
          <input
            ref={setRefs}
            type="checkbox"
            id={id}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={handleChange}
            disabled={disabled}
            className={styles.checkboxInput}
          />
          <span className={styles.checkboxControl}>
            <span className={styles.checkmark} />
          </span>
        </span>
        {label && <span className={styles.checkboxText}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// =============================================================================
// SELECT (Popup Menu Style)
// =============================================================================

function SelectInner<T = string>(
  {
    value,
    defaultValue,
    onChange,
    options,
    placeholder = 'Select...',
    disabled = false,
    className,
  }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<T | undefined>(
    value ?? defaultValue
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Controlled vs uncontrolled
  const currentValue = value !== undefined ? value : selectedValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    setSelectedValue(option.value);
    onChange?.(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const setTriggerRefs = (node: HTMLButtonElement | null) => {
    (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div className={`${styles.selectContainer} ${className || ''}`}>
      <button
        ref={setTriggerRefs}
        type="button"
        className={`${styles.selectTrigger} ${disabled ? styles.disabled : ''} ${isOpen ? styles.open : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.selectValue}>
          {selectedOption?.label || placeholder}
        </span>
        <span className={styles.selectArrow}>▾</span>
      </button>

      {isOpen && (
        <div ref={menuRef} className={styles.selectMenu} role="listbox">
          {options.map((option, index) => (
            <div
              key={index}
              className={`${styles.selectOption} ${option.value === currentValue ? styles.selected : ''
                } ${option.disabled ? styles.optionDisabled : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={option.value === currentValue}
            >
              {option.value === currentValue && (
                <span className={styles.selectCheck}>✓</span>
              )}
              <span className={styles.optionLabel}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ForwardRef with generics workaround
export const Select = forwardRef(SelectInner) as <T = string>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => React.ReactElement;

(Select as React.FC).displayName = 'Select';
