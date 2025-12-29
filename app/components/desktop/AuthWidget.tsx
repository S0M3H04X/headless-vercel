'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMembershipStore } from '@/store/membershipStore';
import { SystemButton } from '@/components/ui/SystemButton';

type AuthStep = 'email' | 'key';

const AuthAuthenticatedView = ({ user, logout, autoUpgrade = false }: { user: any, logout: () => void, autoUpgrade?: boolean }) => {
  const { currentTier, setTier } = useMembershipStore();
  const [showUpgrade, setShowUpgrade] = useState(autoUpgrade);
  const [upgradeKey, setUpgradeKey] = useState('');

  // Auto-open if passed
  useEffect(() => {
    if (autoUpgrade) setShowUpgrade(true);
  }, [autoUpgrade]);

  const tierTitle = currentTier === 'guest' ? 'Guest' : currentTier === 'tier1' ? 'Tier 1' : 'Tier 2';

  const handleUpgrade = () => {
    if (!upgradeKey) return;

    // Mock Validation
    if (upgradeKey === 'TIER1_2025') {
      alert('Access Granted: Upgraded to Tier 1');
      setTier('tier1');
      window.location.reload();
    } else if (upgradeKey === 'TIER2_2025') {
      alert('Access Granted: Upgraded to Tier 2');
      setTier('tier2');
      window.location.reload();
    } else {
      alert(`Invalid token: ${upgradeKey}`);
    }
    setUpgradeKey('');
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-[#c0c0c0] p-1 shadow-outset border border-gray-400">
      <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm mb-4 flex justify-between">
        <span>My Account</span>
        <span>Active</span>
      </div>
      <div className="px-4 pb-4 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 border border-gray-500 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div className="font-bold text-sm">Current: {tierTitle}</div>
          <div className="text-xs text-gray-600 font-mono mt-1">{user?.email || 'Authenticated User'}</div>
        </div>

        <div className="bg-white p-2 border border-gray-400 shadow-inset text-left text-xs font-mono mb-4">
          <p>{`> Session: ACTIVE`}</p>
          <p>{`> Tier: ${currentTier.toUpperCase()}`}</p>
        </div>

        {/* Upgrade Section */}
        {currentTier !== 'tier2' && (
          <div className="mb-4 text-left border-t border-gray-400 pt-2">
            {!showUpgrade ? (
              <button onClick={() => setShowUpgrade(true)} className="text-xs text-blue-800 underline">
                Have an upgrade token?
              </button>
            ) : (
              <div className="flex gap-1 items-center">
                <input
                  className="border border-gray-500 text-xs p-1 w-full"
                  placeholder="Enter Token Key"
                  value={upgradeKey}
                  onChange={(e) => setUpgradeKey(e.target.value)}
                />
                <button onClick={handleUpgrade} className="bg-gray-200 border border-gray-500 text-xs px-2 py-1">OK</button>
              </div>
            )}
          </div>
        )}

        <SystemButton onClick={logout}>
          Log Out
        </SystemButton>
      </div>
    </div>
  );
};

export const AuthWidget: React.FC<{ content?: any }> = ({ content }) => {
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
    // window.location.reload();
  };

  // [Fix] 登入後顯示會員資訊 (My Account View)
  if (isAuthenticated) {
    return (
      <AuthAuthenticatedView
        user={user}
        logout={handleLogout}
        autoUpgrade={content?.sourceId === 'auth-upgrade'}
      />
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
                placeholder="********"
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