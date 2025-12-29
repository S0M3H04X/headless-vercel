// app/hooks/usePermissions.ts
'use client';

import { useMembershipStore } from '@/store/membershipStore';
import { MembershipTier, ResourceType } from '@/lib/types/permissions';

/**
 * Hook for checking user permissions in React components
 * Provides reactive permission checks that update when tier changes
 */
export function usePermissions() {
  const {
    currentTier,
    canAccess,
    canAccessWidget,
    canAccessFolder,
    canAccessApp,
    canCustomizeColors,
    canCustomizeFonts,
    canSaveTheme,
    getMaxOpenWindows,
    meetsMinimumTier,
  } = useMembershipStore();

  return {
    // Current tier info
    tier: currentTier,
    isGuest: currentTier === 'guest',
    isTier1: currentTier === 'tier1',
    isTier2: currentTier === 'tier2',

    // Generic access check
    canAccess: (type: ResourceType, id: string) => canAccess(type, id),

    // Specific access checks
    canAccessWidget,
    canAccessFolder,
    canAccessApp,

    // Style permissions
    canCustomizeColors: canCustomizeColors(),
    canCustomizeFonts: canCustomizeFonts(),
    canSaveTheme: canSaveTheme(),

    // System limits
    maxOpenWindows: getMaxOpenWindows(),

    // Tier comparison
    requiresTier: (tier: MembershipTier) => meetsMinimumTier(tier),
  };
}

/**
 * Hook specifically for style customization permissions
 */
export function useStylePermissions() {
  const { canCustomizeColors, canCustomizeFonts, canSaveTheme, currentTier } =
    useMembershipStore();

  return {
    tier: currentTier,
    colors: canCustomizeColors(),
    fonts: canCustomizeFonts(),
    save: canSaveTheme(),

    // Helper to check if ANY customization is allowed
    anyCustomization: canCustomizeColors() || canCustomizeFonts(),
  };
}
