"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import KnowledgeTree from '@/components/KnowledgeTree';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Flame, 
  Sparkles, 
  CheckCircle,
  Play,
  Pause,
  Award,
  Terminal,
  BookOpen,
  BookMarked,
  Music,
  Gamepad2,
  Calendar,
  MessageSquare,
  Trophy,
  Leaf,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationProvider';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [quickResponse, setQuickResponse] = useState('');
  const [chatting, setChatting] = useState(false);
  const [activeTaskIdx, setActiveTaskIdx] = useState<number | null>(null);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const notify = useNotification();

  useEffect(() => {
    if (!isAuthenticated) {
      return; // Wait for layout to handle auto-login
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/');
        setData(response.data);
        if (response.data.study_plan) {
          setStudyPlan(response.data.study_plan);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, router, logout]);

  const toggleTask = (idx: number, taskTitle: string) => {
    if (activeTaskIdx === idx) {
      setActiveTaskIdx(null);
    } else {
      setActiveTaskIdx(idx);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Starting task: ${taskTitle}. Let's do this!`);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const response = await api.post('/planner/generate');
      setStudyPlan(response.data.plan);
      notify.success('Study plan successfully generated!');
    } catch (error: any) {
      console.error("Failed to generate plan:", error);
      notify.error(error.response?.data?.message || "Failed to generate plan. Please try again.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleQuickChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessage.trim()) return;

    setChatting(true);
    setQuickResponse('');
    try {
      const response = await api.post('/buddy/chat', { message: quickMessage, mode: 'Motivation Coach' });
      setQuickResponse(response.data.message);
      setQuickMessage('');
    } catch (error) {
      console.error("Chat error:", error);
      setQuickResponse("Failed to connect to TomBuddy. Please check your network.");
    } finally {
      setChatting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center relative z-10">
        <div className="h-12 w-12 animate-[spin_2s_linear_infinite] rounded-full border-4 border-emerald-500/30 border-t-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-rose-500 font-semibold relative z-10">Error loading dashboard data</div>;

  const currentLevelXpTarget = 100;
  const currentXpProgress = data.user.xp % currentLevelXpTarget;
  const xpPercentage = Math.min((currentXpProgress / currentLevelXpTarget) * 100, 100);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12 relative z-10 w-full overflow-hidden"
    >
      
      {/* Welcome Banner (Glassmorphism) */}
      <motion.section 
        variants={itemVariants}
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] rounded-tr-[4rem] bg-white dark:bg-[#061B11] backdrop-blur-2xl border-2 border-emerald-200 dark:border-emerald-500 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(16,185,129,0.25)] overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-[60px] -z-10 pointer-events-none"></div>

        <div className="space-y-3 max-w-xl">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-sm cursor-default"
          >
            👋 Welcome Back
          </motion.span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Hello, {user?.email?.split('@')[0] || 'user'}! 
            <motion.span 
              animate={{ rotate: [0, 20, 0, 20, 0] }} 
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block"
            >👋</motion.span>
          </h1>
          <p className="text-slate-600 dark:text-emerald-100/70 text-base leading-relaxed">
            Let's make today a great day of learning. Work on your knowledge tree, review vocabulary, or tackle a new coding lesson!
          </p>
        </div>
        
        <div className="flex gap-4 items-center shrink-0">
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="flex flex-col items-center justify-center bg-white dark:bg-[#081C12] backdrop-blur-md w-32 h-32 rounded-3xl border-2 border-amber-200 dark:border-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.15)] dark:shadow-[0_10px_30px_rgba(245,158,11,0.2)] relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Flame className="h-8 w-8 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1">{data.streak}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-1">Day Streak</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="flex flex-col items-center justify-center bg-white dark:bg-[#081C12] backdrop-blur-md w-40 h-32 rounded-3xl border-2 border-emerald-200 dark:border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.15)] dark:shadow-[0_10px_30px_rgba(16,185,129,0.2)] relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 blur-xl rounded-full group-hover:bg-emerald-500/30 transition-colors duration-300"></div>
            <Award className="h-8 w-8 text-emerald-500 fill-emerald-500/20 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 relative z-10">Level {data.user.level}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-1 relative z-10">{data.user.xp} Total XP</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Progress Bar Section */}
      <motion.div variants={itemVariants} className="px-2 relative">
        <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-emerald-100 mb-2">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" /> Progress to Level {data.user.level + 1}
          </span>
          <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">{currentXpProgress} / {currentLevelXpTarget} XP</span>
        </div>
        <div className="h-4 w-full bg-slate-200/50 dark:bg-[#04150D]/80 backdrop-blur-sm rounded-full overflow-hidden border border-white/40 dark:border-emerald-900/50 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] relative"
          >
            {/* Glossy overlay on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/40 animate-[shimmer_2s_infinite]"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* Left Hand Column (Knowledge Tree & Quick Access) */}
        <div className="space-y-6 flex flex-col w-full">
          
          {/* Knowledge Tree Container */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="rounded-[2.5rem] border-2 border-emerald-200 dark:border-emerald-500 bg-white dark:bg-[#061B11] backdrop-blur-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_20px_50px_rgba(16,185,129,0.4)] transition-all duration-300 relative overflow-hidden group w-full"
          >
            {/* Glowing background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-400/20 dark:group-hover:bg-emerald-500/10 transition-colors duration-500"></div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-8 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white">
                <Leaf className="h-5 w-5" />
              </div>
              Knowledge Tree
            </h3>
            
            <div className="relative h-64 w-full flex items-center justify-center z-10">
               <KnowledgeTree stage={data.knowledge_tree.stage} points={data.knowledge_tree.points} />
            </div>

            <div className="mt-6 bg-emerald-50 dark:bg-[#04150D] backdrop-blur-md rounded-2xl p-5 border-2 border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between shadow-sm relative z-10">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[11px] font-bold text-white text-center leading-tight shadow-md shadow-emerald-500/30">
                {currentXpProgress}/{currentLevelXpTarget}<br/>stage
              </div>
              <div className="flex-1 ml-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-slate-600 dark:text-emerald-100/70 text-xs">XP to next stage</span>
                </div>
                <div className="w-full h-2 bg-slate-200/50 dark:bg-emerald-950/50 rounded-full overflow-hidden border border-white/30 dark:border-emerald-900/30">
                   <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${xpPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Access Card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[2.5rem] border-2 border-emerald-200 dark:border-emerald-500 bg-white dark:bg-[#061B11] backdrop-blur-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(16,185,129,0.25)] w-full"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              Quick Access
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] gap-4 place-items-center w-full">
               {[
                 { name: 'Coding', path: '/dashboard/lessons', icon: Terminal, color: 'text-indigo-600 dark:text-indigo-400', glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]', border: 'hover:border-indigo-400 dark:hover:border-indigo-500' },
                 { name: 'Vocab', path: '/dashboard/vocabulary', icon: BookOpen, color: 'text-purple-600 dark:text-purple-400', glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]', border: 'hover:border-purple-400 dark:hover:border-purple-500' },
                 { name: 'Stories', path: '/dashboard/stories', icon: BookMarked, color: 'text-amber-600 dark:text-amber-400', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]', border: 'hover:border-amber-400 dark:hover:border-amber-500' },
                 { name: 'Music', path: '/dashboard/music', icon: Music, color: 'text-blue-600 dark:text-blue-400', glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]', border: 'hover:border-blue-400 dark:hover:border-blue-500' },
                 { name: 'Games', path: '/dashboard/games', icon: Gamepad2, color: 'text-pink-600 dark:text-pink-400', glow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]', border: 'hover:border-pink-400 dark:hover:border-pink-500' }
               ].map((item, i) => (
                 <motion.div key={i} whileHover={{ y: -5, scale: 1.05 }} className="w-full">
                   <Link href={item.path} className="flex flex-col items-center gap-2 group w-full">
                     <div className={`h-16 w-16 w-full rounded-[1.2rem] bg-emerald-50 dark:bg-[#081C12] backdrop-blur-sm border-2 border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:bg-white dark:group-hover:bg-[#0B2418] ${item.glow} ${item.border}`}>
                       <item.icon className={`h-6 w-6 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                     </div>
                     <span className="text-[11px] font-semibold text-slate-500 dark:text-emerald-100/60 group-hover:text-slate-800 dark:group-hover:text-emerald-300 transition-colors">{item.name}</span>
                   </Link>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        </div>

        {/* Right Columns */}
        <div className="space-y-6 lg:col-span-2 flex flex-col w-full">
          
          {/* Daily Study Planner Card */}
          <motion.div 
            variants={itemVariants}
            className={`rounded-[2.5rem] rounded-tl-[4rem] border-2 ${studyPlan ? 'border-emerald-500 dark:border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border-emerald-200 dark:border-emerald-500 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(16,185,129,0.25)]'} bg-white dark:bg-[#061B11] backdrop-blur-2xl p-6 sm:p-8 flex-1 flex flex-col relative overflow-hidden group transition-all duration-500 w-full`}
          >
             <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
             
             <div className="flex-1 space-y-4 z-10 w-full flex flex-col h-full">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                   <div className="h-12 w-12 rounded-[1.2rem] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white">
                     <Calendar className="h-6 w-6" />
                   </div>
                   Daily Study Planner
                 </h3>
                 <motion.button 
                   whileHover={{ scale: (generatingPlan || !!studyPlan) ? 1 : 1.05 }}
                   whileTap={{ scale: (generatingPlan || !!studyPlan) ? 1 : 0.95 }}
                   onClick={handleGeneratePlan}
                   disabled={generatingPlan || !!studyPlan}
                   className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3.5 rounded-[1.2rem] transition-all duration-300 shadow-[0_10px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/50"
                 >
                   {generatingPlan ? (
                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                   ) : (
                     <Sparkles className="h-4 w-4" />
                   )}
                   {studyPlan ? 'Plan Active' : 'Generate Plan'}
                 </motion.button>
               </div>
               <p className="text-sm text-slate-500 dark:text-emerald-100/70 sm:ml-16">Generate a personalized study checklist based on your current level</p>

               {!studyPlan ? (
                 <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full gap-8 mt-8">
                   <div className="h-32 w-32 shrink-0 bg-emerald-50 dark:bg-[#081C12] backdrop-blur-md rounded-[2rem] border-2 border-emerald-200 dark:border-emerald-800/60 p-6 flex items-center justify-center shadow-lg relative">
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-400 blur-md animate-pulse"></div>
                      <CheckCircle className="h-full w-full text-emerald-400/80 dark:text-emerald-500/60" />
                   </div>
                   <div className="text-center md:text-left space-y-2 max-w-xs">
                     <h4 className="text-xl font-bold text-slate-800 dark:text-white">No active plan today</h4>
                     <p className="text-slate-500 dark:text-emerald-100/60 text-sm leading-relaxed">Click the button above to AI-generate your custom learning path!</p>
                   </div>
                 </div>
               ) : (
                 <div className="flex-1 mt-6 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                   <AnimatePresence>
                     {studyPlan.tasks.map((task: any, idx: number) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         key={idx} 
                         className={`flex items-center gap-4 p-4 sm:p-5 rounded-[1.2rem] border-2 shadow-sm transition-all group ${
                            activeTaskIdx === idx 
                              ? 'bg-emerald-100 dark:bg-[#061B11] border-emerald-400 dark:border-emerald-500 scale-[1.02] shadow-md' 
                              : 'bg-emerald-50 dark:bg-[#081C12] border-emerald-100 dark:border-emerald-800 hover:shadow-md hover:-translate-y-1'
                          }`}
                        >
                          <div className="h-6 w-6 rounded-full border-2 border-emerald-300 dark:border-emerald-700 flex-shrink-0 cursor-pointer group-hover:border-emerald-500 transition-colors relative overflow-hidden">
                            <div className={`absolute inset-0 bg-emerald-500 transition-transform duration-300 ${activeTaskIdx === idx ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 dark:text-emerald-50">{task.title}</h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-emerald-400/80 mt-1 flex items-center gap-1.5">
                              {activeTaskIdx === idx ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-emerald-800"></span>
                              )}
                              {activeTaskIdx === idx ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">In Progress...</span>
                              ) : (
                                <span>{task.duration_mins} mins</span>
                              )}
                            </p>
                          </div>
                          <button 
                            onClick={() => toggleTask(idx, task.title)}
                            className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm border ${
                              activeTaskIdx === idx 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/30' 
                                : 'bg-emerald-50 dark:bg-[#0B2418] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white border-emerald-100 dark:border-emerald-800/50'
                            }`}
                          >
                            {activeTaskIdx === idx ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 ml-0.5" />
                            )}
                          </button>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
               )}
             </div>
          </motion.div>

          {/* Bottom Row Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto sm:h-64 w-full">
            {/* Ask TomBuddy AI */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="rounded-[2.5rem] border-2 border-emerald-200 dark:border-emerald-500 bg-white dark:bg-[#061B11] backdrop-blur-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all duration-300 flex flex-col h-full group overflow-hidden relative w-full"
            >
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white dark:bg-[#081C12] flex items-center justify-center border border-white/50 dark:border-emerald-800/50 shadow-md shadow-emerald-500/10 p-2">
                  <img src="/logo.png" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Ask TomBuddy AI</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-emerald-100/60">Your 24/7 learning assistant</p>
                </div>
              </div>

              <form onSubmit={handleQuickChat} className="bg-emerald-50 dark:bg-[#081C12] backdrop-blur-md rounded-2xl p-3 border-2 border-emerald-100 dark:border-emerald-800/60 flex flex-col justify-between flex-1 gap-2 shadow-sm relative z-10">
                 {quickResponse ? (
                   <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#061B11] p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 line-clamp-2">🤖 {quickResponse}</p>
                 ) : (
                   <p className="text-slate-600 dark:text-emerald-100/60 text-xs px-1 font-medium">Ask for motivation or any question!</p>
                 )}
                 <div className="flex items-center gap-2 mt-auto">
                   <input
                     type="text"
                     placeholder="Type a message..."
                     value={quickMessage}
                     onChange={(e) => setQuickMessage(e.target.value)}
                     className="flex-1 bg-white dark:bg-[#0B2418] border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-400"
                   />
                   <button type="submit" disabled={chatting || !quickMessage.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-xl disabled:opacity-50 transition-all shadow-md cursor-pointer">
                     {chatting ? <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <MessageSquare className="h-4 w-4" />}
                   </button>
                 </div>
              </form>
            </motion.div>

            {/* Achievements */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="rounded-[2.5rem] rounded-br-[4rem] border-2 border-emerald-200 dark:border-emerald-500 bg-white dark:bg-[#061B11] backdrop-blur-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all duration-300 flex flex-col h-full relative overflow-hidden w-full"
            >
              <div className="flex items-center justify-between mb-2 relative z-10 w-full">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" /> Achievements
                </h3>
                <Link href="#" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors flex items-center gap-1 group">
                  View All <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-emerald-100/60 mb-6 relative z-10">Keep learning to unlock new badges!</p>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(48px,1fr))] gap-3 flex-1 place-items-center relative z-10 w-full">
                 <div className="flex items-center justify-center group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_5px_15px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform duration-300 relative">
                       <div className="absolute inset-0 border-2 border-white/40 rounded-2xl"></div>
                       <Leaf className="h-5 w-5 text-white" />
                    </div>
                 </div>
                 {[1,2,3].map(i => (
                 <div key={i} className="flex items-center justify-center group cursor-not-allowed">
                    <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-[#081C12]/50 backdrop-blur-sm border border-white/50 dark:border-emerald-900/30 flex items-center justify-center shadow-inner group-hover:bg-white/80 dark:group-hover:bg-[#081C12] transition-colors">
                       <Lock className="h-4 w-4 text-slate-400 dark:text-emerald-800/60" />
                    </div>
                 </div>
                 ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
