// app/lib/utils/tierUtils.ts

/**
 * User tier hierarchy for access control
 * guest < member < pro < admin
 */
export type UserTier = 'guest' | 'member' | 'pro' | 'admin';

// Tier hierarchy levels (higher = more access)
const TIER_LEVELS: Record<UserTier, number> = {
  guest: 0,
  member: 1,
  pro: 2,    // Member + extra token key verification
  admin: 3,
};

/**
 * Check if user has sufficient tier access
 * @param userTier - The user's current tier
 * @param requiredTier - The minimum tier required for access
 * @returns true if user has sufficient access
 */
export function canAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  return TIER_LEVELS[userTier] >= TIER_LEVELS[requiredTier];
}

/**
 * Get the next tier upgrade from current tier
 */
export function getNextTier(currentTier: UserTier): UserTier | null {
  switch (currentTier) {
    case 'guest': return 'member';
    case 'member': return 'pro';
    case 'pro': return 'admin';
    case 'admin': return null;
  }
}

/**
 * Get display name for tier
 */
export function getTierDisplayName(tier: UserTier): string {
  switch (tier) {
    case 'guest': return 'Guest';
    case 'member': return 'Member';
    case 'pro': return 'Pro';
    case 'admin': return 'Admin';
  }
}
