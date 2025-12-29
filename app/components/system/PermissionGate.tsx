// app/components/system/PermissionGate.tsx
'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { MembershipTier, ResourceType } from '@/lib/types/permissions';
import { LockedContent } from '@/components/system/LockedContent';

interface PermissionGateProps {
  children: React.ReactNode;

  // Option 1: Check by minimum tier
  requiredTier?: MembershipTier;

  // Option 2: Check by resource type + ID
  resourceType?: ResourceType;
  resourceId?: string;

  // Optional: Custom fallback component
  fallback?: React.ReactNode;

  // Optional: Completely hide instead of showing locked
  hideWhenLocked?: boolean;
}

/**
 * PermissionGate - Conditionally renders children based on user permissions
 * 
 * Usage examples:
 * 
 * // By tier:
 * <PermissionGate requiredTier="tier1">
 *   <PremiumFeature />
 * </PermissionGate>
 * 
 * // By resource:
 * <PermissionGate resourceType="widget" resourceId="video_mixer">
 *   <VideoMixer />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredTier,
  resourceType,
  resourceId,
  fallback,
  hideWhenLocked = false,
}) => {
  const { requiresTier, canAccess } = usePermissions();

  // Determine if access is granted
  let hasAccess = true;

  if (requiredTier) {
    hasAccess = requiresTier(requiredTier);
  } else if (resourceType && resourceId) {
    hasAccess = canAccess(resourceType, resourceId);
  }

  // If access granted, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If should hide completely, render nothing
  if (hideWhenLocked) {
    return null;
  }

  // Render fallback or default locked content
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <LockedContent
      requiredTier={requiredTier || 'tier1'}
      resourceType={resourceType}
      resourceId={resourceId}
    />
  );
};

/**
 * Higher-order component version for class components or SSR
 */
export function withPermissionGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<PermissionGateProps, 'children'>
) {
  return function PermissionGatedComponent(props: P) {
    return (
      <PermissionGate {...options}>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}
