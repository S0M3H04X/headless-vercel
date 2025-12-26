'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SystemButton } from '@/components/ui/SystemButton';

type AuthStep = 'email' | 'otp';

export const AuthWidget: React.FC = () => {
  const { login, isAuthenticated } = useAuthStore();
  
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. 請求 OTP
  const handleRequestOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStep('otp'); // 切換到輸入驗證碼畫面
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // 2. 驗證 OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 驗證成功：重新載入狀態 (Soft Reset)
      // login() 會觸發 AuthStore 的狀態更新，進而改變 Desktop 顯示
      await login(); 
      
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. 緊急後門 (Emergency Backdoor)
  const handleLegacyLogin = () => {
    if (confirm("Launch Legacy Login (Redirect Mode)?")) {
       login(); // 這裡呼叫的是原本 store 裡的邏輯 (導向 /api/auth/login)
    }
  };

  // 如果已登入，AuthWidget 自動隱藏 (由 Desktop 控制)，或顯示歡迎訊息
  if (isAuthenticated) return null;

  return (
    <div className="w-full max-w-sm mx-auto bg-[#c0c0c0] p-1 shadow-outset border border-gray-400">
      <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm mb-4 flex justify-between items-center">
        <span>System Login</span>
        <button className="text-white hover:bg-red-600 px-1">✕</button>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-4 text-sm">
           {step === 'email' ? 'Enter your email to access the system.' : `Enter code sent to ${email}`}
        </div>

        {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-500 text-red-700 text-xs font-mono">
                Error: {error}
            </div>
        )}

        <div className="space-y-4">
          {step === 'email' ? (
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full p-2 border-2 border-gray-600 shadow-inset bg-white font-mono text-sm focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
            />
          ) : (
            <input
              type="text"
              placeholder="XXXXXX"
              className="w-full p-2 border-2 border-gray-600 shadow-inset bg-white font-mono text-sm tracking-widest text-center focus:outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
            />
          )}

          <div className="flex justify-between items-center pt-2">
            {step === 'otp' && (
                <button 
                    onClick={() => setStep('email')}
                    className="text-xs text-blue-800 underline hover:text-blue-600"
                >
                    Back
                </button>
            )}
            <div className="flex-1"></div>
            <SystemButton 
                onClick={step === 'email' ? handleRequestOtp : handleVerifyOtp}
                disabled={loading}
            >
              {loading ? 'Processing...' : (step === 'email' ? 'Next >' : 'Unlock System')}
            </SystemButton>
          </div>
        </div>
      </div>

      {/* 緊急後門：隱藏式連結 */}
      <div className="mt-2 text-center opacity-30 hover:opacity-100 transition-opacity">
         <button onClick={handleLegacyLogin} className="text-[10px] text-gray-500 cursor-help">
            π
         </button>
      </div>
    </div>
  );
};