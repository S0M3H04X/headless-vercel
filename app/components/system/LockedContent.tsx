// app/components/system/LockedContent.tsx
'use client';

import React from 'react';
import { MembershipTier, ResourceType } from '@/lib/types/permissions';
import { usePermissions } from '@/hooks/usePermissions';

interface LockedContentProps {
  requiredTier: MembershipTier;
  resourceType?: ResourceType;
  resourceId?: string;
  title?: string;
  message?: string;
}

/**
 * LockedContent - Displays a placeholder for content the user cannot access
 * Shows a lock icon and upgrade prompt
 */
export const LockedContent: React.FC<LockedContentProps> = ({
  requiredTier,
  resourceType,
  resourceId,
  title,
  message,
}) => {
  const { tier } = usePermissions();

  const tierLabels: Record<MembershipTier, string> = {
    guest: 'Guest',
    tier1: 'Member',
    tier2: 'Premium',
  };

  const defaultTitle = resourceId
    ? `${resourceId} is locked`
    : 'Content Locked';

  const defaultMessage = `This ${resourceType || 'content'} requires ${tierLabels[requiredTier]} access.`;

  return (
    <div
      className="locked-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: 'var(--ds-spacing-lg)',
        backgroundColor: 'var(--ds-color-background-alt)',
        borderRadius: '4px',
        textAlign: 'center',
        color: 'var(--ds-color-text-muted)',
      }}
    >
      {/* Lock Icon */}
      <div
        style={{
          fontSize: '48px',
          marginBottom: 'var(--ds-spacing-md)',
          opacity: 0.6,
        }}
      >
        🔒
      </div>

      {/* Title */}
      <h3
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-sm)',
          fontFamily: 'var(--ds-font-system)',
          fontSize: 'var(--ds-font-size-lg)',
          color: 'var(--ds-color-text)',
        }}
      >
        {title || defaultTitle}
      </h3>

      {/* Message */}
      <p
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-md)',
          fontSize: 'var(--ds-font-size-sm)',
          maxWidth: '250px',
        }}
      >
        {message || defaultMessage}
      </p>

      {/* Current tier badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: 'var(--ds-color-primary)',
          borderRadius: '12px',
          fontSize: 'var(--ds-font-size-xs)',
          fontFamily: 'var(--ds-font-mono)',
        }}
      >
        Current: {tierLabels[tier]}
      </div>

      {/* Upgrade hint */}
      <p
        style={{
          marginTop: 'var(--ds-spacing-md)',
          fontSize: 'var(--ds-font-size-xs)',
          opacity: 0.7,
        }}
      >
        Upgrade to unlock this feature
      </p>
    </div>
  );
};
