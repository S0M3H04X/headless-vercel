// app/components/system/LockedContent.tsx
'use client';

import React from 'react';
import { MembershipTier, ResourceType } from '@/lib/types/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemButton } from '@/components/ui/SystemButton'; // [新增]
import { useWorkspaceStore } from '@/store/workspaceStore'; // [新增]
import { WidgetKind } from '@/lib/types/workspace'; // [新增]

interface LockedContentProps {
  requiredTier: MembershipTier;
  resourceType?: ResourceType;
  resourceId?: string;
  title?: string;
  message?: string;
  showLoginButton?: boolean; // [新增] 可選：是否顯示登入按鈕 (預設 true)
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
  showLoginButton = true, // Default to true
}) => {
  const { tier, isGuest } = usePermissions();
  const { openWindow } = useWorkspaceStore();

  const handleLogin = () => {
    openWindow({
      title: 'Member Login',
      content: { kind: WidgetKind.Auth, sourceId: 'auth-locked' },
      initialGeometry: { width: 320, height: 400, x: 'center', y: 'center' }
    });
  };

  const handleUpgrade = () => {
    openWindow({
      title: 'Upgrade Membership',
      content: { kind: WidgetKind.Auth, sourceId: 'auth-upgrade' },
      initialGeometry: { width: 320, height: 400, x: 'center', y: 'center' }
    });
  };

  const tierLabels: Record<MembershipTier, string> = {
    guest: 'Guest',
    tier1: 'Tier 1',
    tier2: 'Tier 2',
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
          marginBottom: 'var(--ds-spacing-md)',
        }}
      >
        Current: {tierLabels[tier]}
      </div>

      {/* Login Button (Only for guests) */}
      {isGuest && showLoginButton && (
        <div style={{ marginTop: 'var(--ds-spacing-sm)' }}>
          <SystemButton onClick={handleLogin}>
            Login to Access
          </SystemButton>
        </div>
      )}

      {/* Upgrade Button (for non-guests) */}
      {(!isGuest || !showLoginButton) && (
        <div style={{ marginTop: 'var(--ds-spacing-sm)' }}>
          <SystemButton onClick={handleUpgrade}>
            Upgrade Tier
          </SystemButton>
        </div>
      )}
    </div>
  );
};
