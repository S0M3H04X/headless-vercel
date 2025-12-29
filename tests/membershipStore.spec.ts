// tests/membershipStore.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMembershipStore } from '@/store/membershipStore';
import { TIER_PERMISSIONS, meetsMinimumTier, getTierLevel } from '@/lib/types/permissions';

describe('MembershipStore', () => {
  beforeEach(() => {
    // Reset to default state before each test
    useMembershipStore.setState({ currentTier: 'guest' });
  });

  describe('Tier Management', () => {
    it('TC-01: Initial state should be guest tier', () => {
      const { currentTier } = useMembershipStore.getState();
      expect(currentTier).toBe('guest');
    });

    it('TC-02: setTier should update currentTier', () => {
      useMembershipStore.getState().setTier('tier1');
      expect(useMembershipStore.getState().currentTier).toBe('tier1');

      useMembershipStore.getState().setTier('tier2');
      expect(useMembershipStore.getState().currentTier).toBe('tier2');
    });

    it('TC-03: getTierPermissions should return correct permissions per tier', () => {
      // Guest
      useMembershipStore.setState({ currentTier: 'guest' });
      let permissions = useMembershipStore.getState().getTierPermissions();
      expect(permissions).toEqual(TIER_PERMISSIONS.guest);
      expect(permissions.canCustomizeColors).toBe(false);

      // Tier 1
      useMembershipStore.setState({ currentTier: 'tier1' });
      permissions = useMembershipStore.getState().getTierPermissions();
      expect(permissions).toEqual(TIER_PERMISSIONS.tier1);
      expect(permissions.canCustomizeColors).toBe(true);
      expect(permissions.canCustomizeFonts).toBe(false);

      // Tier 2
      useMembershipStore.setState({ currentTier: 'tier2' });
      permissions = useMembershipStore.getState().getTierPermissions();
      expect(permissions).toEqual(TIER_PERMISSIONS.tier2);
      expect(permissions.canCustomizeFonts).toBe(true);
    });
  });

  describe('Widget Access', () => {
    it('TC-04: Guest should only access basic widgets', () => {
      useMembershipStore.setState({ currentTier: 'guest' });
      const { canAccessWidget } = useMembershipStore.getState();

      // Allowed widgets
      expect(canAccessWidget('media_player')).toBe(true);
      expect(canAccessWidget('pdf_viewer')).toBe(true);
      expect(canAccessWidget('folder_browser')).toBe(true);

      // Restricted widgets
      expect(canAccessWidget('shopify_product')).toBe(false);
      expect(canAccessWidget('cart_manager')).toBe(false);
      expect(canAccessWidget('video_mixer')).toBe(false);
    });

    it('TC-05: Tier1 should access more widgets', () => {
      useMembershipStore.setState({ currentTier: 'tier1' });
      const { canAccessWidget } = useMembershipStore.getState();

      // All guest widgets
      expect(canAccessWidget('media_player')).toBe(true);

      // Tier 1 additions
      expect(canAccessWidget('shopify_product')).toBe(true);
      expect(canAccessWidget('cart_manager')).toBe(true);
      expect(canAccessWidget('user_profile')).toBe(true);

      // Still restricted
      expect(canAccessWidget('video_mixer')).toBe(false);
    });

    it('TC-06: Tier2 should access all widgets', () => {
      useMembershipStore.setState({ currentTier: 'tier2' });
      const { canAccessWidget } = useMembershipStore.getState();

      expect(canAccessWidget('media_player')).toBe(true);
      expect(canAccessWidget('shopify_product')).toBe(true);
      expect(canAccessWidget('video_mixer')).toBe(true);
      // Note: tier2 explicitly lists all widgets, unknown widgets are not automatically allowed
    });
  });

  describe('Folder Access', () => {
    it('TC-07: Guest should only access /public', () => {
      useMembershipStore.setState({ currentTier: 'guest' });
      const { canAccessFolder } = useMembershipStore.getState();

      expect(canAccessFolder('/public')).toBe(true);
      expect(canAccessFolder('/public/images')).toBe(true);
      expect(canAccessFolder('/members')).toBe(false);
      expect(canAccessFolder('/shop')).toBe(false);
    });

    it('TC-08: Tier1 should access member folders', () => {
      useMembershipStore.setState({ currentTier: 'tier1' });
      const { canAccessFolder } = useMembershipStore.getState();

      expect(canAccessFolder('/public')).toBe(true);
      expect(canAccessFolder('/members')).toBe(true);
      expect(canAccessFolder('/members/docs')).toBe(true);
      expect(canAccessFolder('/shop')).toBe(true);
    });

    it('TC-09: Tier2 should access all folders', () => {
      useMembershipStore.setState({ currentTier: 'tier2' });
      const { canAccessFolder } = useMembershipStore.getState();

      expect(canAccessFolder('/public')).toBe(true);
      expect(canAccessFolder('/admin')).toBe(true);
      expect(canAccessFolder('/any/path')).toBe(true);
    });
  });

  describe('Style Permissions', () => {
    it('TC-10: Guest cannot customize styles', () => {
      useMembershipStore.setState({ currentTier: 'guest' });
      const state = useMembershipStore.getState();

      expect(state.canCustomizeColors()).toBe(false);
      expect(state.canCustomizeFonts()).toBe(false);
      expect(state.canSaveTheme()).toBe(false);
    });

    it('TC-11: Tier1 can customize colors only', () => {
      useMembershipStore.setState({ currentTier: 'tier1' });
      const state = useMembershipStore.getState();

      expect(state.canCustomizeColors()).toBe(true);
      expect(state.canCustomizeFonts()).toBe(false);
      expect(state.canSaveTheme()).toBe(true);
    });

    it('TC-12: Tier2 can customize everything', () => {
      useMembershipStore.setState({ currentTier: 'tier2' });
      const state = useMembershipStore.getState();

      expect(state.canCustomizeColors()).toBe(true);
      expect(state.canCustomizeFonts()).toBe(true);
      expect(state.canSaveTheme()).toBe(true);
    });
  });

  describe('Tier Comparison', () => {
    it('TC-13: meetsMinimumTier should correctly compare tiers', () => {
      expect(meetsMinimumTier('guest', 'guest')).toBe(true);
      expect(meetsMinimumTier('guest', 'tier1')).toBe(false);
      expect(meetsMinimumTier('guest', 'tier2')).toBe(false);

      expect(meetsMinimumTier('tier1', 'guest')).toBe(true);
      expect(meetsMinimumTier('tier1', 'tier1')).toBe(true);
      expect(meetsMinimumTier('tier1', 'tier2')).toBe(false);

      expect(meetsMinimumTier('tier2', 'guest')).toBe(true);
      expect(meetsMinimumTier('tier2', 'tier1')).toBe(true);
      expect(meetsMinimumTier('tier2', 'tier2')).toBe(true);
    });

    it('TC-14: getTierLevel should return correct numeric levels', () => {
      expect(getTierLevel('guest')).toBe(0);
      expect(getTierLevel('tier1')).toBe(1);
      expect(getTierLevel('tier2')).toBe(2);
    });
  });

  describe('Max Windows', () => {
    it('TC-15: Max open windows varies by tier', () => {
      useMembershipStore.setState({ currentTier: 'guest' });
      expect(useMembershipStore.getState().getMaxOpenWindows()).toBe(3);

      useMembershipStore.setState({ currentTier: 'tier1' });
      expect(useMembershipStore.getState().getMaxOpenWindows()).toBe(6);

      useMembershipStore.setState({ currentTier: 'tier2' });
      expect(useMembershipStore.getState().getMaxOpenWindows()).toBe(20);
    });
  });
});
