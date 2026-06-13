"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNotification } from '@/components/NotificationProvider';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const notify = useNotification();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/auth/register', { username, email, password });
      notify.success('Account created! Please log in.');
      router.push('/login');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8 bg-emerald-50/50 dark:bg-[#041E14] transition-colors duration-300">
      
      {/* Theme Toggle Switch */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50">
        <button 
          onClick={toggleTheme} 
          className="relative flex items-center w-14 h-8 rounded-full bg-white/80 dark:bg-emerald-900/40 p-1 cursor-pointer transition-colors duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-emerald-200 dark:border-emerald-800/50 backdrop-blur-md"
          aria-label="Toggle Theme"
        >
          <motion.div 
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-6 h-6 rounded-full bg-white dark:bg-emerald-400 shadow-md flex items-center justify-center z-10"
            style={{ marginLeft: theme === 'dark' ? 'auto' : '0' }}
          >
            {theme === 'dark' ? <Moon className="h-3 w-3 text-emerald-900" /> : <Sun className="h-3 w-3 text-amber-500" />}
          </motion.div>
        </button>
      </div>

      {/* Dynamic Animated Professional Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Deep emerald gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-teal-50/40 to-emerald-200/30 dark:from-[#02110B] dark:via-[#041E14] dark:to-[#0A3824] transition-colors duration-300" />
        
        {/* Dotted pattern overlay */}
        <div className="absolute right-0 top-1/4 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,#10B981_1px,transparent_1px)] bg-[size:20px_20px] opacity-10 [mask-image:radial-gradient(ellipse_60%_80%_at_60%_50%,#000_70%,transparent_100%)]" />

        {/* Top left subtle dotted pattern */}
        <div className="absolute left-10 top-10 w-64 h-64 bg-[radial-gradient(circle_at_center,#10B981_1px,transparent_1px)] bg-[size:16px_16px] opacity-10 [mask-image:radial-gradient(circle_at_center,#000_40%,transparent_100%)]" />

        {/* Large abstract wave shapes and glowing orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 15, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-[100%] bg-emerald-500/10 blur-[120px] mix-blend-screen"
          style={{ borderTopRightRadius: '100%', borderBottomLeftRadius: '100%' }}
        />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            x: ['0%', '5%', '0%'], 
            y: ['0%', '10%', '0%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[50vw] rounded-[100%] bg-green-500/15 blur-[140px] mix-blend-screen"
          style={{ borderTopRightRadius: '100%', borderBottomLeftRadius: '100%' }}
        />
        
        {/* Custom wave SVG on the bottom/left */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none">
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-emerald-500" fill="currentColor" preserveAspectRatio="none">
            <path d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Small glowing stars/dots */}
        <div className="absolute top-[30%] left-[15%] w-2 h-2 rounded-full bg-green-400 shadow-[0_0_15px_4px_rgba(74,222,128,0.6)]"></div>
        <div className="absolute bottom-[20%] right-[25%] w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_3px_rgba(52,211,153,0.6)]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="rounded-[2.5rem] border border-white/60 dark:border-emerald-800/40 bg-white/70 dark:bg-[#082417]/80 p-10 shadow-[0_20px_50px_rgba(16,185,129,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden transition-colors duration-300">
          {/* Subtle top glare */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_0_30px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-6 border border-emerald-100 dark:border-transparent"
            >
              <Leaf className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-2 font-sans transition-colors duration-300">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 dark:text-emerald-100/70 transition-colors duration-300">
              Join BuddyLearn AI today
            </p>
            
            {/* Divider with leaf */}
            <div className="flex items-center justify-center mt-6 gap-3">
              <div className="h-px w-12 bg-emerald-800/60"></div>
              <Leaf className="h-3 w-3 text-emerald-600/80" />
              <div className="h-px w-12 bg-emerald-800/60"></div>
            </div>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-emerald-100/70 ml-1 transition-colors duration-300" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="h-6 w-6 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center transition-colors duration-300">
                    <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  className="block w-full rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-white/60 dark:bg-[#04150D]/60 pl-12 pr-4 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-emerald-800/60 focus:bg-white dark:focus:bg-[#04150D] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm transition-all"
                  placeholder="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-emerald-100/70 ml-1 transition-colors duration-300" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="h-6 w-6 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center transition-colors duration-300">
                    <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-white/60 dark:bg-[#04150D]/60 pl-12 pr-4 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-emerald-800/60 focus:bg-white dark:focus:bg-[#04150D] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-emerald-100/70 ml-1 transition-colors duration-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="h-6 w-6 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center transition-colors duration-300">
                    <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-white/60 dark:bg-[#04150D]/60 pl-12 pr-12 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-emerald-800/60 focus:bg-white dark:focus:bg-[#04150D] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm transition-all tracking-wide"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-emerald-600 hover:text-emerald-400 focus:outline-none cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] py-3.5 px-4 text-sm font-semibold text-white hover:from-[#34D399] hover:to-[#10B981] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#082417] disabled:opacity-70 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-xs">
            <span className="text-slate-500 dark:text-emerald-100/50 transition-colors duration-300">Already have an account? </span>
            <Link href="/login" className="font-semibold text-emerald-600 dark:text-[#10B981] hover:text-emerald-500 dark:hover:text-[#34D399] transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
