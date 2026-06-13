"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Terminal, 
  BookOpen, 
  MessageSquare, 
  Award, 
  Heart, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  User,
  Gamepad2,
  BookMarked,
  Music,
  Baby,
  Bell
} from 'lucide-react';
import CatCompanion from '@/components/CatCompanion';
import { useNotification } from '@/components/NotificationProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const notify = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isMounted]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Coding Lessons', href: '/dashboard/lessons', icon: Terminal },
    { name: 'Vocabulary', href: '/dashboard/vocabulary', icon: BookOpen },
    { name: 'AI Story Hub', href: '/dashboard/stories', icon: BookMarked },
    { name: 'AI Music Hub', href: '/dashboard/music', icon: Music },
    { name: 'Kids Learning Hub', href: '/dashboard/kids', icon: Baby },
    { name: 'Games Hub', href: '/dashboard/games', icon: Gamepad2 },
    { name: 'AI Buddy Chat', href: '/dashboard/buddy', icon: MessageSquare },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
    { name: 'Emotion Hub', href: '/dashboard/emotion', icon: Heart },
  ];

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-emerald-600 dark:bg-slate-950 dark:text-emerald-400">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-semibold">Syncing experience...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="relative flex h-screen w-full bg-[#F8FAFC] dark:bg-[#04120A] transition-colors duration-300 font-sans overflow-hidden">
      
      {/* Ambient Animated Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle mesh/dots overlay for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10B98115_1px,transparent_1px),linear-gradient(to_bottom,#10B98115_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] dark:opacity-40 opacity-70 transition-opacity duration-300" />
        
        {/* Light Mode Blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-300/20 rounded-full blur-[100px] mix-blend-multiply dark:opacity-0 transition-opacity duration-300 animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-teal-200/30 rounded-full blur-[100px] mix-blend-multiply dark:opacity-0 transition-opacity duration-300 animate-[pulse_10s_ease-in-out_infinite]" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-green-200/20 rounded-full blur-[120px] mix-blend-multiply dark:opacity-0 transition-opacity duration-300 animate-[pulse_12s_ease-in-out_infinite]" style={{animationDelay: '4s'}}></div>
        
        {/* Dark Mode Blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen opacity-0 dark:opacity-100 transition-opacity duration-300 animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-teal-500/10 rounded-full blur-[100px] mix-blend-screen opacity-0 dark:opacity-100 transition-opacity duration-300 animate-[pulse_10s_ease-in-out_infinite]" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-green-500/5 rounded-full blur-[120px] mix-blend-screen opacity-0 dark:opacity-100 transition-opacity duration-300 animate-[pulse_12s_ease-in-out_infinite]" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 dark:bg-[#06150D]/70 backdrop-blur-2xl border-r border-white/50 dark:border-emerald-900/30 shadow-[10px_0_40px_rgba(0,0,0,0.02)] dark:shadow-[10px_0_40px_rgba(0,0,0,0.2)] relative z-20 transition-all duration-300">
        <div className="flex items-center space-x-3 px-6 h-20 border-b border-emerald-100/50 dark:border-emerald-900/30 shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <img src="/logo.png" alt="BuddyLearn Logo" className="h-6 w-6 object-contain" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">Buddy<span className="text-emerald-500 dark:text-emerald-400">Learn</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium group relative overflow-hidden ${
                  isActive 
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-emerald-200/50 dark:border-emerald-500/30' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:text-emerald-600 dark:hover:text-emerald-300 hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                  <Icon className="h-5 w-5" />
                  {isActive && <div className="absolute inset-0 bg-emerald-400 blur-md opacity-40 rounded-full"></div>}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Card */}
        <div className="px-6 py-6 mt-auto">
          <div className="flex items-center space-x-3 p-4 rounded-[1.5rem] bg-white/50 dark:bg-[#04150D]/60 backdrop-blur-md border border-white/60 dark:border-emerald-800/30 shadow-sm group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="h-10 w-10 rounded-full bg-white dark:bg-emerald-900 flex items-center justify-center border-2 border-emerald-500 overflow-hidden shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-shadow">
              <img src="/logo.png" alt="Avatar" className="h-full w-full object-contain p-1" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.email || 'user@email.com'}</h4>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full w-max mt-1 border border-emerald-500/20">Level {(user as any)?.level || 3}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-2 px-4 py-3 mt-4 text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 cursor-pointer w-full hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl group"
          >
            <div className="relative group-hover:-translate-x-1 transition-transform">
              <LogOut className="h-4 w-4" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-[#06150D]/80 backdrop-blur-xl border-b border-white/40 dark:border-emerald-900/30 fixed top-0 inset-x-0 z-30 shadow-sm">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <img src="/logo.png" alt="BuddyLearn Logo" className="h-7 w-7 object-contain" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent">BuddyLearn</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleTheme} 
            className="relative flex items-center w-14 h-8 rounded-full bg-slate-200 dark:bg-emerald-900/40 p-1 cursor-pointer transition-colors duration-300 shadow-inner border border-slate-300 dark:border-emerald-800/50"
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
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 right-0 w-72 bg-white dark:bg-slate-900 z-50 p-6 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent">BuddyLearn Menu</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                          isActive 
                            ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-slate-200 dark:border-slate-700/50 backdrop-blur-md overflow-hidden">
                    <img src="/logo.png" alt="Avatar" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{user?.username}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className="flex w-full items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-sm font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Area */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col relative z-10 w-full pt-16 md:pt-0">
        {/* Top Header */}
        <header className="hidden md:flex h-20 items-center justify-end px-8 gap-6 w-full shrink-0">
          <button 
            onClick={toggleTheme} 
            className="relative flex items-center w-14 h-8 rounded-full bg-white/60 dark:bg-emerald-900/40 p-1 cursor-pointer transition-colors duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-white dark:border-emerald-800/50"
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
          <button 
            onClick={() => notify.info('No new notifications at this time.')}
            className="p-2 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-emerald-900/30 text-slate-500 dark:text-emerald-100/70 hover:text-emerald-600 dark:hover:text-white transition-colors cursor-pointer shadow-sm relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-[#0B1121]"></span>
          </button>
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/60 dark:bg-emerald-900/40 flex items-center justify-center border-2 border-white/80 dark:border-emerald-800/50 shadow-md cursor-pointer hover:border-emerald-500 transition-colors">
            <img src="/logo.png" className="w-6 h-6 object-contain" alt="Avatar" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full mx-auto pb-24">
          {children}
        </main>
        <CatCompanion />
      </div>

    </div>
  );
}
