"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { useNotification } from '@/components/NotificationProvider';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, User, UserCheck, ShieldAlert, Zap, Copy, Check, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const notify = useNotification();
  const { login, isAuthenticated } = useAuthStore();
  
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    notify.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setIdentity(quickEmail);
    setPassword(quickPass);
    
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: quickEmail,
        password: quickPass
      });
      notify.success('Welcome back to BuddyLearn AI!');
      login(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
      notify.error(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.trim() || !password.trim()) {
      notify.warning('Please enter both Email/Phone and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: identity.trim(),
        password: password.trim()
      });
      notify.success('Welcome back to BuddyLearn AI!');
      login(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
      notify.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      // Check if guest account exists first, otherwise register and login
      let res;
      try {
        res = await api.post('/auth/login', { email: 'guest@buddylearn.ai', password: 'guestpassword' });
      } catch (loginErr) {
        // Register guest and login
        await api.post('/auth/register', { 
          username: 'Guest', 
          email: 'guest@buddylearn.ai', 
          password: 'guestpassword', 
          age_group: 'General' 
        });
        res = await api.post('/auth/login', { email: 'guest@buddylearn.ai', password: 'guestpassword' });
      }
      notify.success('Logged in as Guest!');
      login(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
      notify.error('Failed to log in as Guest.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#04120A] px-4 py-12 overflow-y-auto transition-colors duration-300 font-sans">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-[40vw] h-[40vw] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-10 right-10 w-[35vw] h-[35vw] bg-teal-500/10 dark:bg-teal-600/15 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 lg:gap-10">
        
        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          className="w-full max-w-md bg-white/70 dark:bg-[#06150D]/75 backdrop-blur-2xl border border-white/60 dark:border-emerald-900/30 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(16,185,129,0.15)] flex flex-col items-center justify-between"
        >
          <div className="w-full flex flex-col items-center">
            {/* Logo Icon */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-16 w-16 bg-white dark:bg-emerald-950 rounded-2xl flex items-center justify-center border-2 border-emerald-500/30 shadow-md shadow-emerald-500/10 p-2.5 mb-6"
            >
              <img src="/logo.png" alt="BuddyLearn Logo" className="h-full w-full object-contain" />
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center">
              Buddy<span className="text-emerald-500 dark:text-emerald-400">Learn</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-emerald-100/60 mt-2 text-center mb-8 font-medium">
              Log in to continue your AI learning journey.
            </p>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              {/* Identity input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
                  Username, Email, or Phone
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 h-5 w-5 text-slate-400 dark:text-emerald-800" />
                  <input
                    type="text"
                    placeholder="username, email, or +1234567890"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    disabled={loading || guestLoading}
                    className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-slate-400 dark:text-emerald-800" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || guestLoading}
                    className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || guestLoading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-400/30"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6 w-full">
              <div className="border-t border-slate-200 dark:border-emerald-900/30 w-full" />
              <span className="absolute bg-[#F8FAFC] dark:bg-[#06150D] px-3 text-xs font-bold text-slate-400 dark:text-emerald-900 tracking-wider uppercase transition-colors">
                OR
              </span>
            </div>

            {/* Guest Access Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestLogin}
              disabled={loading || guestLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-emerald-300 font-bold py-3.5 rounded-2xl border border-slate-200 dark:border-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer mb-6"
            >
              {guestLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              ) : (
                <>
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                  <span>Continue as Guest</span>
                </>
              )}
            </motion.button>

            {/* Sign Up Link */}
            <p className="text-xs font-medium text-slate-500 dark:text-emerald-100/50">
              New to BuddyLearn?{' '}
              <Link
                href="/register"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Quick Access Credentials Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150, delay: 0.1 }}
          className="w-full max-w-md bg-white/50 dark:bg-[#06150D]/50 backdrop-blur-xl border border-white/50 dark:border-emerald-950/20 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(16,185,129,0.08)] flex flex-col justify-between"
        >
          <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                Quick Access Sandbox
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-emerald-100/60 leading-relaxed mb-6 font-medium">
              Explore all premium learning, music, vocabulary and buddy chat features instantly without creating an account. Click any block below to auto-fill or log in instantly.
            </p>

            <div className="space-y-4">
              {/* Guest Account Box */}
              <div className="p-5 bg-white/80 dark:bg-[#04150D]/80 border border-slate-200 dark:border-emerald-950/30 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Guest Account
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/10">
                    Full Access
                  </span>
                </div>
                
                <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-400 dark:text-emerald-900">Email</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>guest@buddylearn.ai</span>
                      <button 
                        onClick={() => handleCopy('guest@buddylearn.ai', 'Guest Email')}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        {copiedText === 'Guest Email' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-400 dark:text-emerald-900">Password</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>guestpassword</span>
                      <button 
                        onClick={() => handleCopy('guestpassword', 'Guest Password')}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        {copiedText === 'Guest Password' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => { setIdentity('guest@buddylearn.ai'); setPassword('guestpassword'); notify.success('Credentials filled!'); }}
                    className="flex-1 text-center py-2 text-xs font-bold text-slate-600 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-white bg-slate-50 dark:bg-[#06170D] hover:bg-slate-100 dark:hover:bg-emerald-950/30 rounded-xl transition-all border border-slate-200 dark:border-emerald-900/10 cursor-pointer"
                  >
                    Auto Fill
                  </button>
                  <button 
                    onClick={() => handleQuickLogin('guest@buddylearn.ai', 'guestpassword')}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-all cursor-pointer"
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Demo Student Account Box */}
              <div className="p-5 bg-white/80 dark:bg-[#04150D]/80 border border-slate-200 dark:border-emerald-950/30 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Demo Student
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-500/10">
                    Preloaded XP
                  </span>
                </div>
                
                <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-400 dark:text-emerald-900">Email</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>demo@buddylearn.ai</span>
                      <button 
                        onClick={() => handleCopy('demo@buddylearn.ai', 'Demo Email')}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        {copiedText === 'Demo Email' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-400 dark:text-emerald-900">Password</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>demopassword</span>
                      <button 
                        onClick={() => handleCopy('demopassword', 'Demo Password')}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        {copiedText === 'Demo Password' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => { setIdentity('demo@buddylearn.ai'); setPassword('demopassword'); notify.success('Credentials filled!'); }}
                    className="flex-1 text-center py-2 text-xs font-bold text-slate-600 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-white bg-slate-50 dark:bg-[#06170D] hover:bg-slate-100 dark:hover:bg-emerald-950/30 rounded-xl transition-all border border-slate-200 dark:border-emerald-900/10 cursor-pointer"
                  >
                    Auto Fill
                  </button>
                  <button 
                    onClick={() => handleQuickLogin('demo@buddylearn.ai', 'demopassword')}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl transition-all cursor-pointer"
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-emerald-900/70 tracking-wide uppercase border-t border-slate-200/50 dark:border-emerald-950/20 pt-4">
            <Shield className="h-3.5 w-3.5 text-emerald-500/50" />
            <span>Secure Dev Sandbox Environment</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
