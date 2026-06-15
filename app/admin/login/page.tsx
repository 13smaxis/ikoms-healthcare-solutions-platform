"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, KeyRound, ArrowLeft } from 'lucide-react';

type Mode = 'signin' | 'reset';

const LOCAL_ADMIN_SESSION_KEY = 'ikoms_admin_local_session';
const PREDEFINED_ADMIN_EMAIL = 'admin@ikoms.local';
const PREDEFINED_ADMIN_PASSWORD = 'Admin@123';

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMsgs = () => { setError(''); setInfo(''); };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMsgs();
    setLoading(true);
    try {
      if (email.trim().toLowerCase() !== PREDEFINED_ADMIN_EMAIL || password !== PREDEFINED_ADMIN_PASSWORD) {
        throw new Error('Invalid credentials. Use the predefined admin credentials below.');
      }

      const admin = { email: PREDEFINED_ADMIN_EMAIL, full_name: 'IKOMS Admin', role: 'owner' };
      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(admin));
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMsgs();
    setLoading(true);
    try {
      setInfo('Password reset is disabled while predefined local credentials mode is enabled.');
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-700 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-4"><Shield className="w-6 h-6" /></div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {mode === 'signin' && 'Admin sign in'}
            {mode === 'reset' && 'Reset password'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {mode === 'signin' && 'Access the IKOMS admin dashboard.'}
            {mode === 'reset' && 'Password reset is unavailable in local credentials mode.'}
          </p>

          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
            <div><strong>Predefined admin credentials</strong></div>
            <div>Email: <code className="font-mono bg-white px-1 rounded">{PREDEFINED_ADMIN_EMAIL}</code></div>
            <div>Password: <code className="font-mono bg-white px-1 rounded">{PREDEFINED_ADMIN_PASSWORD}</code></div>
          </div>

          {mode === 'signin' && (
            <form onSubmit={signIn} className="space-y-3">
              <input name="email" required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Email" />
              <input name="password" required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Password" />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {info && <div className="text-emerald-700 text-sm">{info}</div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"><Lock className="w-4 h-4" /> {loading ? 'Signing in...' : 'Sign in'}</button>
              <div className="flex justify-end text-xs pt-2">
                <button type="button" onClick={() => { clearMsgs(); setMode('reset'); }} className="text-slate-600 hover:underline inline-flex items-center gap-1"><KeyRound className="w-3 h-3" /> Forgot password?</button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={reset} className="space-y-3">
              <input name="email" required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {info && <div className="text-emerald-700 text-sm">{info}</div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-slate-800 text-white rounded-lg font-semibold disabled:opacity-50">{loading ? 'Sending...' : 'Send reset link'}</button>
              <button type="button" onClick={() => { clearMsgs(); setMode('signin'); }} className="w-full text-xs text-slate-600 hover:underline inline-flex items-center justify-center gap-1 pt-1"><ArrowLeft className="w-3 h-3" /> Back to sign in</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;