"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { useNotification } from '@/components/NotificationProvider';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const notify = useNotification();
  const { isAuthenticated } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      notify.warning('Username, Email and Password are required fields.');
      return;
    }

    if (password.length < 6) {
      notify.warning('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password: password.trim()
      });
      
      notify.success('Registration successful! Please log in.');
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      notify.error(err.response?.data?.message || 'Failed to register. Please check your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#04120A] px-4 py-12 overflow-hidden transition-colors duration-300 font-sans">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[45vw] h-[45vw] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] bg-teal-500/15 dark:bg-teal-600/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 150 }}
        className="relative z-10 w-full max-w-md bg-white/70 dark:bg-[#06150D]/75 backdrop-blur-2xl border border-white/60 dark:border-emerald-900/30 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(16,185,129,0.15)] flex flex-col items-center"
      >
        {/* Logo Icon */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="h-14 w-14 bg-white dark:bg-emerald-950 rounded-2xl flex items-center justify-center border-2 border-emerald-500/30 shadow-md shadow-emerald-500/10 p-2.5 mb-5"
        >
          <img src="/logo.png" alt="BuddyLearn Logo" className="h-full w-full object-contain" />
        </motion.div>

        {/* Heading */}
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">
          Create Account
        </h2>
        <p className="text-xs text-slate-500 dark:text-emerald-100/60 mt-1.5 text-center mb-6 font-medium">
          Sign up to track your learning progress across devices.
        </p>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
              Username
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 h-4 w-4 text-slate-400 dark:text-emerald-800" />
              <input
                type="text"
                placeholder="Coder123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-4 w-4 text-slate-400 dark:text-emerald-800" />
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Phone Number Input (Optional) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1 flex justify-between">
              <span>Phone Number</span>
              <span className="text-[9px] text-slate-400 dark:text-emerald-800 lowercase font-medium">optional</span>
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-4 h-4 w-4 text-slate-400 dark:text-emerald-800" />
              <input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-4 w-4 text-slate-400 dark:text-emerald-800" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
              />
            </div>
          </div>



          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-400/30"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider line */}
        <div className="border-t border-slate-200 dark:border-emerald-900/30 w-full my-6" />

        {/* Log In Link */}
        <p className="text-xs font-medium text-slate-500 dark:text-emerald-100/50">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Log in
          </Link>
        </p>

      </motion.div>
    </div>
  );
}
