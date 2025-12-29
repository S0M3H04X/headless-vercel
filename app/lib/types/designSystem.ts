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
export interface ThemeTokens {
  colors: ColorTokens;
  fonts: FontTokens;
  spacing: SpacingTokens;
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
