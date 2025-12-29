// app/store/designSystemStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ThemeTokens,
  ThemePresetId,
  ColorTokens,
  FontTokens,
  CLASSICY_THEME,
  THEME_PRESETS,
} from '@/lib/types/designSystem';
import { useMembershipStore } from './membershipStore';
import { ComponentTokens } from '@/lib/types/designSystem';

// Helper type for nested partial updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface DesignSystemState {
  // Current theme state
  activePresetId: ThemePresetId;
  customTokens: Partial<ThemeTokens> | null;

  // Computed active theme
  getActiveTheme: () => ThemeTokens;

  // Theme management
  setPreset: (presetId: ThemePresetId) => boolean; // Returns false if tier insufficient

  // Token customization (tier-gated)
  customizeColors: (colors: Partial<ColorTokens>) => boolean;
  customizeFonts: (fonts: Partial<FontTokens>) => boolean;
  customizeComponents: (components: DeepPartial<ComponentTokens>) => boolean;
  resetCustomizations: () => void;

  // CSS variable sync
  applyCssVariables: () => void;
}

/**
 * Helper to merge tokens with overrides
 */
function mergeTokens(
  base: ThemeTokens,
  overrides: Partial<ThemeTokens> | null
): ThemeTokens {
  if (!overrides) return base;

  return {
    colors: { ...base.colors, ...overrides.colors },
    fonts: { ...base.fonts, ...overrides.fonts },
    spacing: { ...base.spacing, ...overrides.spacing },
    components: {
      window: { ...base.components.window, ...overrides.components?.window },
      menu: { ...base.components.menu, ...overrides.components?.menu },
      button: { ...base.components.button, ...overrides.components?.button },
    }
  };
}

/**
 * Apply theme tokens to CSS custom properties
 */
function syncCssVariables(tokens: ThemeTokens) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply color variables
  Object.entries(tokens.colors).forEach(([key, value]) => {
    root.style.setProperty(`--ds-color-${kebabCase(key)}`, value);
  });

  // Apply font variables
  Object.entries(tokens.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--ds-font-${kebabCase(key)}`, value);
  });

  // Apply spacing variables
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--ds-spacing-${key}`, value);
  });

  // [新增] Apply component variables
  Object.entries(tokens.components).forEach(([componentName, props]) => {
    Object.entries(props).forEach(([prop, value]) => {
      root.style.setProperty(`--ds-comp-${componentName}-${kebabCase(prop)}`, value as string);
    });
  });
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export const useDesignSystemStore = create<DesignSystemState>()(
  persist(
    (set, get) => ({
      activePresetId: 'classicy',
      customTokens: null,

      getActiveTheme: () => {
        const { activePresetId, customTokens } = get();
        const preset = THEME_PRESETS.find((p) => p.id === activePresetId);
        const baseTokens = preset?.tokens || CLASSICY_THEME;
        return mergeTokens(baseTokens, customTokens);
      },

      setPreset: (presetId) => {
        const preset = THEME_PRESETS.find((p) => p.id === presetId);
        if (!preset) return false;

        // Check tier permission
        const { meetsMinimumTier } = useMembershipStore.getState();
        if (!meetsMinimumTier(preset.requiredTier)) {
          console.warn(`[DesignSystem] Preset "${presetId}" requires tier: ${preset.requiredTier}`);
          return false;
        }

        set({ activePresetId: presetId });
        get().applyCssVariables();
        return true;
      },

      customizeColors: (colors) => {
        const { canCustomizeColors } = useMembershipStore.getState();
        if (!canCustomizeColors()) {
          console.warn('[DesignSystem] Color customization requires Tier 1+');
          return false;
        }

        set((state) => ({
          customTokens: {
            ...state.customTokens,
            colors: { ...state.customTokens?.colors, ...colors },
          },
        }));
        get().applyCssVariables();
        return true;
      },

      customizeFonts: (fonts) => {
        const { canCustomizeFonts } = useMembershipStore.getState();
        if (!canCustomizeFonts()) {
          console.warn('[DesignSystem] Font customization requires Tier 2');
          return false;
        }

        set((state) => ({
          customTokens: {
            ...state.customTokens,
            fonts: { ...state.customTokens?.fonts, ...fonts },
          },
        }));
        get().applyCssVariables();
        return true;
      },

      customizeComponents: (components) => {
        const { canCustomizeColors } = useMembershipStore.getState(); // [Updated] Tier 1 Access
        if (!canCustomizeColors()) {
          console.warn('[DesignSystem] Component customization requires Tier 1');
          return false;
        }

        set((state) => ({
          customTokens: {
            ...state.customTokens,
            components: {
              // Default to empty objects if undefined to ensure spread works
              window: { ...(state.customTokens?.components?.window || {}), ...components.window },
              menu: { ...(state.customTokens?.components?.menu || {}), ...components.menu },
              button: { ...(state.customTokens?.components?.button || {}), ...components.button },
            } as any
          },
        }));
        get().applyCssVariables();
        return true;
      },

      resetCustomizations: () => {
        set({ customTokens: null });
        get().applyCssVariables();
      },

      applyCssVariables: () => {
        const theme = get().getActiveTheme();
        syncCssVariables(theme);
      },
    }),
    {
      name: 'headless-design-system-storage',
      partialize: (state) => ({
        activePresetId: state.activePresetId,
        customTokens: state.customTokens,
      }),
      // Apply CSS variables after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Small delay to ensure DOM is ready
          setTimeout(() => state.applyCssVariables(), 0);
        }
      },
    }
  )
);
