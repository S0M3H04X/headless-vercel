// app/lib/types/designSystem.ts

/**
 * Design System Token Types
 * Defines the structure for customizable design tokens
 */

/**
 * Color token schema
 */
export interface ColorTokens {
  // Primary brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary/accent colors
  secondary: string;
  accent: string;

  // Background colors
  background: string;
  backgroundAlt: string;
  surface: string;

  // Text colors
  text: string;
  textMuted: string;
  textInverse: string;

  // UI state colors
  highlight: string;
  highlightText: string;

  // System colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Font token schema  
 */
export interface FontTokens {
  // Font families
  system: string;
  display: string;
  mono: string;
  pixel: string;

  // Font sizes (rem values)
  sizeXs: string;
  sizeSm: string;
  sizeMd: string;
  sizeLg: string;
  sizeXl: string;
  size2xl: string;
}

/**
 * Spacing token schema (for consistency)
 */
export interface SpacingTokens {
  xs: string;    // 4px
  sm: string;    // 8px
  md: string;    // 16px
  lg: string;    // 24px
  xl: string;    // 32px
  xxl: string;   // 48px
}

/**
 * Complete theme tokens
 */
/**
 * Component token schema
 */
export interface ComponentTokens {
  window: {
    background: string;
    titleBarBackground: string;
    titleBarText: string;
    borderColor: string;
  };
  menu: {
    background: string;
    text: string;
    itemHoverBackground: string;
    itemHoverText: string;
    separator: string;
  };
  button: {
    background: string;
    text: string;
    border: string;
    shadow: string;
  };
}

/**
 * Complete theme tokens
 */
export interface ThemeTokens {
  colors: ColorTokens;
  fonts: FontTokens;
  spacing: SpacingTokens;
  components: ComponentTokens; // [新增]
}

/**
 * Theme preset identifier
 */
export type ThemePresetId = 'classicy' | 'dark' | 'nature' | 'custom';

/**
 * Theme preset with metadata
 */
export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  tokens: ThemeTokens;
  requiredTier: 'guest' | 'tier1' | 'tier2';
}

/**
 * Default "Classicy" theme (matches existing platinum style)
 */
export const CLASSICY_THEME: ThemeTokens = {
  colors: {
    primary: '#dfdfdf',
    primaryLight: '#efefef',
    primaryDark: '#cdcdcd',
    secondary: '#b7e498',
    accent: '#000080',
    background: '#b7e498',
    backgroundAlt: '#a8d589',
    surface: '#ffffff',
    text: '#000000',
    textMuted: '#666666',
    textInverse: '#ffffff',
    highlight: '#000080',
    highlightText: '#ffffff',
    success: '#2e8b57',
    warning: '#ffa500',
    error: '#dc143c',
    info: '#4169e1',
  },
  fonts: {
    system: "'ChicagoKare', 'Geneva', 'Helvetica Neue', sans-serif",
    display: "'ChicagoKare', 'Geneva', sans-serif",
    mono: "'Ishmeria', monospace",
    pixel: "'Ishmeria', monospace",
    sizeXs: '0.75rem',
    sizeSm: '0.875rem',
    sizeMd: '1rem',
    sizeLg: '1.125rem',
    sizeXl: '1.25rem',
    size2xl: '1.5rem',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  components: {
    window: {
      background: '#dfdfdf',
      titleBarBackground: '#808080', // [Modified] Default Gray as requested
      titleBarText: '#ffffff',
      borderColor: '#000000',
    },
    menu: {
      background: '#e0e0e0',
      text: '#000000',
      itemHoverBackground: '#000080',
      itemHoverText: '#ffffff',
      separator: '#a0a0a0',
    },
    button: {
      background: '#dfdfdf',
      text: '#000000',
      border: '#000000',
      shadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #000000',
    },
  },
};

/**
 * Dark theme preset
 */
export const DARK_THEME: ThemeTokens = {
  colors: {
    primary: '#2d2d2d',
    primaryLight: '#3d3d3d',
    primaryDark: '#1d1d1d',
    secondary: '#4a90a4',
    accent: '#61dafb',
    background: '#1a1a2e',
    backgroundAlt: '#16213e',
    surface: '#2d2d2d',
    text: '#e4e4e4',
    textMuted: '#888888',
    textInverse: '#000000',
    highlight: '#61dafb',
    highlightText: '#000000',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },
  fonts: {
    ...CLASSICY_THEME.fonts,
  },
  spacing: {
    ...CLASSICY_THEME.spacing,
  },
  components: {
    window: {
      background: '#2d2d2d',
      titleBarBackground: '#1a1a2e',
      titleBarText: '#e4e4e4',
      borderColor: '#4a90a4',
    },
    menu: {
      background: '#1a1a2e',
      text: '#e4e4e4',
      itemHoverBackground: '#4a90a4',
      itemHoverText: '#000000',
      separator: '#444444',
    },
    button: {
      background: '#3d3d3d',
      text: '#e4e4e4',
      border: '#4a90a4',
      shadow: 'none',
    },
  },
};

/**
 * Nature theme preset
 */
export const NATURE_THEME: ThemeTokens = {
  colors: {
    primary: '#d4e7d4',
    primaryLight: '#e8f5e8',
    primaryDark: '#c0d9c0',
    secondary: '#8fbc8f',
    accent: '#228b22',
    background: '#f0f7f0',
    backgroundAlt: '#e0efe0',
    surface: '#ffffff',
    text: '#2d4a2d',
    textMuted: '#5a7a5a',
    textInverse: '#ffffff',
    highlight: '#228b22',
    highlightText: '#ffffff',
    success: '#228b22',
    warning: '#daa520',
    error: '#b22222',
    info: '#4682b4',
  },
  fonts: {
    ...CLASSICY_THEME.fonts,
  },
  spacing: {
    ...CLASSICY_THEME.spacing,
  },
  components: {
    window: {
      background: '#f0f7f0',
      titleBarBackground: '#228b22',
      titleBarText: '#ffffff',
      borderColor: '#228b22',
    },
    menu: {
      background: '#e8f5e8',
      text: '#2d4a2d',
      itemHoverBackground: '#228b22',
      itemHoverText: '#ffffff',
      separator: '#8fbc8f',
    },
    button: {
      background: '#d4e7d4',
      text: '#2d4a2d',
      border: '#228b22',
      shadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #8fbc8f',
    },
  },
};

/**
 * All available theme presets
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classicy',
    name: 'Classicy',
    description: 'Classic platinum retro theme',
    tokens: CLASSICY_THEME,
    requiredTier: 'guest',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Modern dark theme',
    tokens: DARK_THEME,
    requiredTier: 'tier1',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Calm forest-inspired theme',
    tokens: NATURE_THEME,
    requiredTier: 'tier1',
  },
];
