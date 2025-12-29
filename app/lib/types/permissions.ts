// app/lib/types/permissions.ts

/**
 * Membership Tier Types
 * Defines the hierarchy: guest < tier1 < tier2
 */
export type MembershipTier = 'guest' | 'tier1' | 'tier2';

/**
 * Permission levels for different access types
 */
export type AccessLevel = 'none' | 'read' | 'write';

/**
 * Resource types that can have permission controls
 */
export type ResourceType = 'widget' | 'folder' | 'app' | 'file';

/**
 * Permission configuration for each tier
 */
export interface TierPermissions {
  // Content access
  accessibleWidgets: string[];      // Widget kinds user can open
  accessibleApps: string[];         // App IDs user can launch
  accessibleFolders: string[];      // Folder paths user can browse

  // Style customization
  canCustomizeColors: boolean;      // Can change color tokens
  canCustomizeFonts: boolean;       // Can change font tokens
  canSaveTheme: boolean;            // Can persist custom theme

  // System limits
  maxOpenWindows: number;           // Max concurrent windows
  maxStorageMb: number;             // Max local storage usage
}

/**
 * Default permission configurations for each tier
 */
export const TIER_PERMISSIONS: Record<MembershipTier, TierPermissions> = {
  guest: {
    accessibleWidgets: [
      'streaming_widget',   // [修正] Guest 只能用 Streaming Widget (尚未實作)
      'folder_browser',     // 保留基本瀏覽
      'auth',               // [新增] Guest 必須能訪問登入 Widget
    ],
    accessibleApps: ['finder'],
    accessibleFolders: ['/public'],
    canCustomizeColors: false,
    canCustomizeFonts: false,
    canSaveTheme: false,
    maxOpenWindows: 3,
    maxStorageMb: 5,
  },

  tier1: {
    accessibleWidgets: [
      'streaming_widget',
      'folder_browser',
      'media_player',       // [修正] Media 是 Tier 1
      'pdf_viewer',         // [修正] PDF 是 Tier 1
      'shopify_product',
      'product_image',      // [新增] Commercial
      'product_title',      // [新增] Commercial
      'product_desc',       // [新增] Commercial
      'cart_manager',
      'collection_app',
      'user_profile',
      'style_editor',       // [新增] Control Panel
    ],
    accessibleApps: ['finder', 'shop', 'profile'],
    accessibleFolders: ['/public', '/members', '/shop'],
    canCustomizeColors: true,
    canCustomizeFonts: false,
    canSaveTheme: true,
    maxOpenWindows: 6,
    maxStorageMb: 50,
  },

  tier2: {
    accessibleWidgets: [
      // Full access to all widgets
      'media_player',
      'pdf_viewer',
      'folder_browser',
      'shopify_product',
      'product_image',
      'product_title',
      'product_desc',
      'cart_manager',
      'collection_app',
      'user_profile',
      'auth',
      'video_control',
      'video_visual',
      'video_mixer',
      'style_editor',
    ],
    accessibleApps: ['*'], // Wildcard for all apps
    accessibleFolders: ['*'], // Wildcard for all folders
    canCustomizeColors: true,
    canCustomizeFonts: true,
    canSaveTheme: true,
    maxOpenWindows: 20,
    maxStorageMb: 500,
  },
};

/**
 * Get tier hierarchy level (higher = more permissions)
 */
export function getTierLevel(tier: MembershipTier): number {
  const levels: Record<MembershipTier, number> = {
    guest: 0,
    tier1: 1,
    tier2: 2,
  };
  return levels[tier];
}

/**
 * Check if a tier meets minimum requirements
 */
export function meetsMinimumTier(
  currentTier: MembershipTier,
  requiredTier: MembershipTier
): boolean {
  return getTierLevel(currentTier) >= getTierLevel(requiredTier);
}
