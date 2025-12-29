// app/store/membershipStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MembershipTier,
  TierPermissions,
  ResourceType,
  TIER_PERMISSIONS,
  meetsMinimumTier,
} from '@/lib/types/permissions';

interface MembershipState {
  // Current user tier
  currentTier: MembershipTier;

  // Tier management
  setTier: (tier: MembershipTier) => void;

  // Permission getters
  getTierPermissions: () => TierPermissions;

  // Access check helpers
  canAccess: (resourceType: ResourceType, resourceId: string) => boolean;
  canAccessWidget: (widgetKind: string) => boolean;
  canAccessFolder: (folderPath: string) => boolean;
  canAccessApp: (appId: string) => boolean;

  // Style permission helpers
  canCustomizeColors: () => boolean;
  canCustomizeFonts: () => boolean;
  canSaveTheme: () => boolean;

  // System limit helpers
  getMaxOpenWindows: () => number;

  // Tier comparison
  meetsMinimumTier: (requiredTier: MembershipTier) => boolean;
}

export const useMembershipStore = create<MembershipState>()(
  persist(
    (set, get) => ({
      currentTier: 'guest',

      setTier: (tier) => {
        set({ currentTier: tier });
      },

      getTierPermissions: () => {
        return TIER_PERMISSIONS[get().currentTier];
      },

      canAccess: (resourceType, resourceId) => {
        const permissions = get().getTierPermissions();

        switch (resourceType) {
          case 'widget':
            return get().canAccessWidget(resourceId);
          case 'folder':
            return get().canAccessFolder(resourceId);
          case 'app':
            return get().canAccessApp(resourceId);
          case 'file':
            // Files inherit folder permissions
            const folderPath = resourceId.substring(0, resourceId.lastIndexOf('/')) || '/';
            return get().canAccessFolder(folderPath);
          default:
            return false;
        }
      },

      canAccessWidget: (widgetKind) => {
        const permissions = get().getTierPermissions();
        // Tier2 with '*' has full access
        if (permissions.accessibleWidgets.includes('*')) return true;
        return permissions.accessibleWidgets.includes(widgetKind);
      },

      canAccessFolder: (folderPath) => {
        const permissions = get().getTierPermissions();
        // Tier2 with '*' has full access
        if (permissions.accessibleFolders.includes('*')) return true;
        // Check if folder starts with any accessible path
        return permissions.accessibleFolders.some(
          (allowed) => folderPath === allowed || folderPath.startsWith(allowed + '/')
        );
      },

      canAccessApp: (appId) => {
        const permissions = get().getTierPermissions();
        // Tier2 with '*' has full access
        if (permissions.accessibleApps.includes('*')) return true;
        return permissions.accessibleApps.includes(appId);
      },

      canCustomizeColors: () => {
        return get().getTierPermissions().canCustomizeColors;
      },

      canCustomizeFonts: () => {
        return get().getTierPermissions().canCustomizeFonts;
      },

      canSaveTheme: () => {
        return get().getTierPermissions().canSaveTheme;
      },

      getMaxOpenWindows: () => {
        return get().getTierPermissions().maxOpenWindows;
      },

      meetsMinimumTier: (requiredTier) => {
        return meetsMinimumTier(get().currentTier, requiredTier);
      },
    }),
    {
      name: 'headless-membership-storage',
      // Only persist the tier, not the functions
      partialize: (state) => ({ currentTier: state.currentTier }),
    }
  )
);
