"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { useNotification } from '@/components/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, KeyRound, Lock, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const notify = useNotification();
  const { isAuthenticated } = useAuthStore();
  
  const [step, setStep] = useState(1); // 1: Send Request, 2: Reset Form
  const [identity, setIdentity] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.trim()) {
      notify.warning('Please enter your Email or Phone Number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        identity: identity.trim()
      });
      
      notify.success('A reset code has been sent!');
      if (res.data.otp_debug) {
        setDebugOtp(res.data.otp_debug);
      }
      setStep(2);
    } catch (err: any) {
      if (err.response?.status !== 400 && err.response?.status !== 404) {
        console.error(err);
      }
      notify.error(err.response?.data?.message || 'Failed to trigger reset. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      notify.warning('Please populate all verification fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.warning('New Password and Confirm Password fields do not match.');
      return;
    }

    if (newPassword.length < 6) {
      notify.warning('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        identity: identity.trim(),
        otp: otp.trim(),
        new_password: newPassword.trim()
      });
      
      notify.success('Password updated! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      if (err.response?.status !== 400 && err.response?.status !== 401) {
        console.error(err);
      }
      notify.error(err.response?.data?.message || 'Invalid verification code or expired session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#04120A] px-4 overflow-hidden transition-colors duration-300 font-sans">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] bg-teal-500/10 dark:bg-teal-600/15 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 150 }}
        className="relative z-10 w-full max-w-md bg-white/70 dark:bg-[#06150D]/75 backdrop-blur-2xl border border-white/60 dark:border-emerald-900/30 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(16,185,129,0.15)] flex flex-col items-center"
      >
        {/* Step-based Wizard */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              {/* Back Link */}
              <Link
                href="/login"
                className="self-start text-xs font-bold text-slate-500 dark:text-emerald-100/60 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>

              {/* Logo Icon */}
              <div className="h-16 w-16 bg-white dark:bg-emerald-950 rounded-2xl flex items-center justify-center border-2 border-emerald-500/30 shadow-md shadow-emerald-500/10 p-2.5 mb-6">
                <KeyRound className="h-full w-full text-emerald-500 object-contain" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">
                Forgot Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-emerald-100/60 mt-2 text-center mb-8 font-medium">
                Enter your account email or phone number. We'll send you a 6-digit OTP verification code.
              </p>

              <form onSubmit={handleSendCode} className="w-full space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
                    Email or Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 h-5 w-5 text-slate-400 dark:text-emerald-800" />
                    <input
                      type="text"
                      placeholder="you@domain.com or +1234567890"
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-400/30"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <button
                onClick={() => {
                  setStep(1);
                  setDebugOtp(null);
                }}
                disabled={loading}
                className="self-start text-xs font-bold text-slate-500 dark:text-emerald-100/60 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Request a new code</span>
              </button>

              <div className="h-16 w-16 bg-white dark:bg-emerald-950 rounded-2xl flex items-center justify-center border-2 border-emerald-500/30 shadow-md shadow-emerald-500/10 p-2.5 mb-6">
                <ShieldCheck className="h-full w-full text-emerald-500 object-contain" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">
                Verify OTP Code
              </h2>
              <p className="text-xs text-slate-500 dark:text-emerald-100/60 mt-2 text-center mb-6 font-medium">
                Enter the 6-digit verification code and set your new password.
              </p>

              {/* Developer OTP Debug Box */}
              {debugOtp && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-4 mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                    Demo Verification Code (Local testing)
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-300 select-all tracking-widest font-mono">
                    {debugOtp}
                  </span>
                </motion.div>
              )}

              <form onSubmit={handleResetPassword} className="w-full space-y-4">
                
                {/* OTP Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3 px-4 text-center text-xl font-bold tracking-widest text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                {/* New Password Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 h-4 w-4 text-slate-400 dark:text-emerald-800" />
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-50 dark:bg-[#04150D]/60 border border-slate-200 dark:border-emerald-900/30 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-emerald-100/70 tracking-wide uppercase px-1">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 h-4 w-4 text-slate-400 dark:text-emerald-800" />
                    <input
                      type="password"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      <span>Reset Password</span>
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
