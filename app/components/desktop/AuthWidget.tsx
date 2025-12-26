'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SystemButton } from '@/components/ui/SystemButton';

type AuthStep = 'email' | 'key'; // Renamed 'otp' to 'key'

export const AuthWidget: React.FC = () => {
  const { login } = useAuthStore(); // 注意：需確保 store 的 login 支援重整狀態
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // 1. 請求 Access Key
  const handleRequestKey = async () => {
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await fetch('/api/auth/key/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStep('key');
      setMsg('Key sent to your email.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 登入 (Login with Key)
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // 呼叫新的 Login API (Proxy)
      const res = await fetch('/api/auth/login', {
        method: 'POST', // 確保 login route 支援 POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: accessKey }), // Key as password
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 成功：觸發全域狀態重整
      window.location.reload(); // 簡單暴力，確保所有 Widget 拿到最新 Token
      // 或使用 await login() 如果 store 支援 soft reset
      
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-[#c0c0c0] p-1 shadow-outset border border-gray-400">
      <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm mb-4 flex justify-between">
        <span>System Login</span>
        <span>v2.0</span>
      </div>

      <div className="px-4 pb-4">
        {msg && <div className="mb-3 text-green-700 text-xs">{msg}</div>}
        {error && <div className="mb-3 text-red-700 text-xs">{error}</div>}

        <div className="space-y-4">
          {step === 'email' ? (
            <div>
                <label className="block text-xs mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full p-2 border-2 border-gray-600 shadow-inset bg-white font-mono text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestKey()}
                />
            </div>
          ) : (
            <div>
                <label className="block text-xs mb-1">Access Key</label>
                <input
                  type="password" // 隱藏輸入
                  placeholder="******"
                  className="w-full p-2 border-2 border-gray-600 shadow-inset bg-white font-mono text-sm tracking-widest"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <div className="mt-1 text-[10px] text-gray-500">Check your inbox for the key.</div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            {step === 'key' && (
                <button onClick={() => setStep('email')} className="text-xs text-blue-800 underline">Back</button>
            )}
            <div className="flex-1"></div>
            <SystemButton 
                onClick={step === 'email' ? handleRequestKey : handleLogin}
                disabled={loading}
            >
              {loading ? 'Processing...' : (step === 'email' ? 'Get Key' : 'Enter System')}
            </SystemButton>
          </div>
        </div>
      </div>
    </div>
  );
};