'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SystemButton } from '@/components/ui/SystemButton';

type AuthStep = 'email' | 'key';

export const AuthWidget: React.FC = () => {
  const { login, logout, isAuthenticated, user } = useAuthStore();
  
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // 當 user 變更時，自動切換顯示
  useEffect(() => {
      if (isAuthenticated) {
          setLoading(false);
      }
  }, [isAuthenticated]);

  const handleRequestKey = async () => {
    setLoading(true); setError(''); setMsg('');
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
    } catch (e: any) { setError(e.message); } 
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: accessKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // 登入成功，刷新狀態
      window.location.reload();
    } catch (e: any) { setError(e.message); setLoading(false); }
  };

  const handleLogout = async () => {
      await logout();
      window.location.reload();
  };

  // [Fix] 登入後顯示會員資訊 (My Account View)
  if (isAuthenticated) {
      return (
        <div className="w-full max-w-sm mx-auto bg-[#c0c0c0] p-1 shadow-outset border border-gray-400">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm mb-4 flex justify-between">
                <span>My Account</span>
                <span>Active</span>
            </div>
            <div className="px-4 pb-4 text-center">
                <div className="mb-4">
                    <img src="/assets/classicy/img/icons/system/users/user.png" className="w-12 h-12 mx-auto mb-2 opacity-80" alt="User" />
                    <div className="font-bold text-sm">Member Access Granted</div>
                    <div className="text-xs text-gray-600 font-mono mt-1">{user?.email || 'Authenticated User'}</div>
                </div>
                
                <div className="bg-white p-2 border border-gray-400 shadow-inset text-left text-xs font-mono mb-4 h-24 overflow-y-auto">
                    <p>{`> Session Type: OS_NATIVE`}</p>
                    <p>{`> Permissions: READ_WRITE`}</p>
                    <p>{`> Status: CONNECTED`}</p>
                    <p>{`> Encrypted: YES`}</p>
                </div>

                <SystemButton onClick={handleLogout}>
                    Log Out
                </SystemButton>
            </div>
        </div>
      );
  }

  // 未登入視圖 (保持不變)
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
                  type="password"
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