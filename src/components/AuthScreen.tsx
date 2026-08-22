import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { loginLocal } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await loginLocal(username, password);
    if (!result.success) setError(result.message);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4" dir="rtl">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-[#CF2F2F] p-3 text-white"><LockKeyhole className="w-6 h-6" /></div>
          <div><h1 className="text-xl font-bold text-slate-900">ورود به سامانه مپنا</h1><p className="text-sm text-slate-500">حساب کاربری سازمانی</p></div>
        </div>
        <label className="block text-sm font-semibold mb-1">نام کاربری</label>
        <input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" className="w-full mb-4 rounded-lg border border-slate-300 px-3 py-2.5" dir="ltr" />
        <label className="block text-sm font-semibold mb-1">رمز عبور</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" className="w-full mb-4 rounded-lg border border-slate-300 px-3 py-2.5" dir="ltr" />
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="w-full rounded-lg bg-[#CF2F2F] py-3 font-bold text-white disabled:opacity-60">{submitting ? 'در حال ورود...' : 'ورود'}</button>
      </form>
    </main>
  );
};