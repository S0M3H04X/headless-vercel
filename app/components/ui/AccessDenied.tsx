'use client';
import React from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { useAuthStore } from '@/store/authStore';

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
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#c0c0c0]">
      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4 border-2 border-gray-400">
        <span className="text-2xl text-gray-500">🔒</span>
      </div>
      <div className="text-red-600 font-bold mb-2 text-lg">Access Restricted</div>
      <p className="text-xs text-gray-600 mb-6 max-w-[180px] leading-relaxed">
        {message || `This feature requires ${requiredTier} access.`}
        <br />Please verify your identity.
      </p>
      <Button onClick={login} isDefault={true}>
        Login / Register
      </Button>
    </div>
  );
};
