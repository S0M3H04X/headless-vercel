'use client';
import React from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { useAuthStore } from '@/store/authStore';
import styles from './AccessDenied.module.scss';

interface AccessDeniedProps {
  requiredTier?: string;
  message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredTier = 'member',
  message
}) => {
  const { login } = useAuthStore();

  return (
    <div className={`${styles.accessDenied} w-full h-full flex flex-col items-center justify-center p-6 text-center gap-4`}>
      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4 border-2 border-gray-400">
        <span className="text-2xl text-gray-500">🔒</span>
      </div>
      <div className="text-red-600 font-bold mb-2 text-2xl">Access Restricted</div>
      <p className="text-lg text-gray-900 mb-6 max-w-[300px] leading-relaxed">
        {message || `This feature requires ${requiredTier} access.`}
        <br />Please verify your identity.
      </p>
      <Button onClick={login} isDefault={true}>
        Get Access
      </Button>
    </div>
  );
};
