'use client';
// app/components/ui/primitives/Tabs.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  forwardRef,
  useId,
} from 'react';
import type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsPanelProps,
  TabsContextValue,
} from './types';
import styles from './Tabs.module.scss';

// =============================================================================
// CONTEXT
// =============================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs');
  }
  return context;
};

// =============================================================================
// TABS ROOT
// =============================================================================

interface TabsComponent extends React.ForwardRefExoticComponent<
  TabsProps & React.RefAttributes<HTMLDivElement>
> {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Panel: typeof TabsPanel;
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, className, children }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    // Controlled vs uncontrolled
    const activeTab = value !== undefined ? value : internalValue;

    const setActiveTab = useCallback(
      (newValue: string) => {
        if (value === undefined) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [value, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div ref={ref} className={`${styles.tabs} ${className || ''}`}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

TabsRoot.displayName = 'Tabs';

// =============================================================================
// TABS LIST (Tab Button Container)
// =============================================================================

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={`${styles.tabList} ${className || ''}`}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'Tabs.List';

// =============================================================================
// TABS TRIGGER (Individual Tab Button)
// =============================================================================

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, disabled, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabsContext();
    const id = useId();
    const isActive = activeTab === value;

    const handleClick = () => {
      if (!disabled) {
        setActiveTab(value);
      }
    };

    const classNames = [
      styles.tabTrigger,
      isActive && styles.active,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`tab-${id}`}
        aria-selected={isActive}
        aria-controls={`panel-${id}`}
        tabIndex={isActive ? 0 : -1}
        className={classNames}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'Tabs.Trigger';

// =============================================================================
// TABS PANEL (Content Panel)
// =============================================================================

const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ value, className, children }, ref) => {
    const { activeTab } = useTabsContext();
    const id = useId();
    const isActive = activeTab === value;

    if (!isActive) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${id}`}
        aria-labelledby={`tab-${id}`}
        tabIndex={0}
        className={`${styles.tabPanel} ${className || ''}`}
      >
        {children}
      </div>
    );
  }
);

TabsPanel.displayName = 'Tabs.Panel';

// =============================================================================
// COMPOUND COMPONENT ASSEMBLY
// =============================================================================

export const Tabs = TabsRoot as TabsComponent;
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Panel = TabsPanel;
