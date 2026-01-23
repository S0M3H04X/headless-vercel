'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/primitives/Button';
import { GroupFrame } from '@/components/ui/primitives/Forms';
import styles from './AuthWidget.module.scss';

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
    // window.location.reload();
  };

  // [Fix] 登入後顯示會員資訊 (My Account View)
  if (isAuthenticated) {
    return (
      <GroupFrame legend="Access Granted" className={styles.logoutContainer}>
        <div className={styles.grantedContainer}>
          <div className="mb-4">
            <div className={styles.userGreeting}>Welcome</div>
            <div className={styles.userAvatar}>
              <span className="text-2xl">👤</span>
            </div>
            <div className={styles.userEmail}>{user?.email || 'Authenticated User'}</div>
          </div>

          <div className={styles.userInfoBox}>
            <p>{`> Session Type: OS_NATIVE`}</p>
            <p>{`> Permissions: READ_WRITE`}</p>
            {/* <p>{`> Status: CONNECTED`}</p> */}
            {/* <p>{`> Encrypted: YES`}</p> */}
            <p>{`> Tier: ${(user?.tier || 'member').toUpperCase()}`}</p>
          </div>

          <Button onClick={handleLogout} className={styles.logoutButton} isDefault={true}>
            Log Out
          </Button>
        </div>
      </GroupFrame>
    );
  }

  // 未登入視圖
  return (
    <GroupFrame legend="Get Your Access Key">
      {msg && <div className="mb-3 text-green-700 text-xs px-2 py-1 bg-green-50 border border-green-200">{msg}</div>}
      {error && <div className="mb-3 text-red-700 text-xs px-2 py-1 bg-red-50 border border-red-200">{error}</div>}

      <div className={styles.loginContainer}>
        {step === 'email' ? (
          <div className={styles.inputGroup}>
            <label className={styles.labelAuth}>Enter Email Address</label>
            <input
              type="email"
              placeholder='address@mail.com'
              className={styles.inputAuth}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRequestKey()}
              autoFocus
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs mb-1 font-bold">Access Key</label>
            <input
              type="password"
              placeholder="********"
              className="w-full p-2 border-2 border-gray-600 shadow-inset bg-white font-mono text-sm tracking-widest focus:outline-none focus:bg-yellow-50"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            <div className="mt-1 text-[10px] text-gray-500">Check your inbox for the key.</div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 gap-2">
          {step === 'key' && (
            <Button onClick={() => setStep('email')} variant="default" className="w-20">Back</Button>
          )}
          <div className="flex-1"></div>
          <Button
            onClick={step === 'email' ? handleRequestKey : handleLogin}
            disabled={loading}
            isDefault={true}
            className="min-w-[100px]"
          >
            {loading ? 'Processing...' : (step === 'email' ? 'Get Key' : 'Enter System')}
          </Button>
        </div>
      </div>
    </GroupFrame>
  );
};