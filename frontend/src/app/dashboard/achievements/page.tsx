"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Award, 
  Lock, 
  Check, 
  Sparkles,
  BookOpen,
  Terminal,
  Flame,
  Milestone
} from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await api.get('/dashboard/achievements');
      setAchievements(response.data);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'award': return <Award className="h-6 w-6" />;
      case 'book-open': return <BookOpen className="h-6 w-6" />;
      case 'code': return <Terminal className="h-6 w-6" />;
      case 'terminal': return <Terminal className="h-6 w-6" />;
      case 'flame': return <Flame className="h-6 w-6 text-amber-500" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Top Banner Stats */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-md">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/5"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Achievements Hub</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Unlock special badges and boost your XP by reaching study goals!</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 rounded-2xl border border-amber-200/30 dark:border-amber-900/20 shrink-0">
            <div className="text-2xl">🏆</div>
            <div>
              <span className="block text-xl font-black text-amber-600 dark:text-amber-400">
                {unlockedCount} / {achievements.length}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Badges Unlocked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Learning Path Map */}
      <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6 shadow-md space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Milestone className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-900 dark:text-white">Knowledge Growth Timeline</h3>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { stage: 1, label: "Seed", emoji: "🌱" },
            { stage: 2, label: "Sprout", emoji: "🌿" },
            { stage: 3, label: "Young Tree", emoji: "🌳" },
            { stage: 4, label: "Knowledge Tree", emoji: "🌲" },
            { stage: 5, label: "Wisdom Tree", emoji: "🌎" }
          ].map((st) => (
            <div key={st.stage} className="flex flex-col items-center space-y-2">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all border ${
                st.stage <= 2 // We will set this based on real stages inside walkthrough/testing
                  ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800/40 text-white'
                  : 'bg-slate-50 border-slate-100 dark:bg-slate-950 dark:border-slate-800/50'
              }`}>
                {st.emoji}
              </div>
              <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400 leading-tight block">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <motion.div
              key={ach.id}
              whileHover={{ y: -2 }}
              className={`rounded-2xl border p-5 flex items-center gap-4 transition-all shadow-sm ${
                ach.unlocked
                  ? 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-600 shadow-md'
                  : 'bg-slate-50/50 border-2 border-slate-100 dark:bg-slate-900/30 dark:border-slate-950/60 opacity-60'
              }`}
            >
              {/* Icon Container */}
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-md transition-all shrink-0 ${
                ach.unlocked
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/10'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-850 dark:text-slate-600 shadow-none'
              }`}>
                {getAchievementIcon(ach.icon_url)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                    {ach.name}
                  </h4>
                  {ach.unlocked ? (
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {ach.description}
                </p>
                <div className="mt-2 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 fill-current" /> +{ach.xp_reward} XP Reward
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
