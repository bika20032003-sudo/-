import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { ASSETS } from '../utils/assets';
import { useProjectData } from '../context/ProjectDataContext';

export default function Login() {
  const { login, isAuthenticated } = useProjectData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@transport.gov.ly');
  const [password, setPassword] = useState('admin2026');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login('admin');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Return to Home link */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>العودة إلى البوابة الرئيسية</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl shadow-black/5">
          <div className="text-center">
            <span className="mx-auto block h-16 w-16 overflow-hidden rounded-full bg-white shadow ring-1 ring-black/10">
              <img
                src={ASSETS.logo}
                alt="شعار الجهاز"
                className="h-full w-full object-cover"
              />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-foreground">
              دخول مدير المشروع
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              لوحة التحكم والمتابعة الميدانية لطريق ﻱ – غات
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 shadow-md"
            >
              <Lock className="h-4 w-4" />
              <span>تسجيل الدخول</span>
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 border-t border-border pt-6 text-center">
            <button
              type="button"
              onClick={() => {
                login('admin');
                navigate('/dashboard');
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gold hover:underline"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>دخول مباشر وسريع للمدير (وضع المعاينة)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
